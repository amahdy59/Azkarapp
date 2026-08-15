const ARABIC_TEXT = /[\u0600-\u06ff]/u;
const LATIN_TEXT = /[A-Za-z]/u;

function staticText(node) {
  if (!node) return "";
  if (node.type === "Literal") return typeof node.value === "string" ? node.value : "";
  if (node.type === "TemplateLiteral") {
    return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join(" ");
  }
  if (node.type === "ArrayExpression") return node.elements.map(staticText).join(" ");
  if (node.type === "ConditionalExpression") {
    return `${staticText(node.consequent)} ${staticText(node.alternate)}`;
  }
  return "";
}

const noInlineBilingualCopy = {
  meta: {
    type: "problem",
    docs: { description: "Require Arabic/English conditional copy to use the i18n bundle" },
    schema: [],
    messages: { inlineCopy: "Move Arabic/English conditional copy into the i18n bundle and call t(language, key)." },
  },
  create(context) {
    return {
      ConditionalExpression(node) {
        const consequent = staticText(node.consequent);
        const alternate = staticText(node.alternate);
        const isBilingualPair =
          (ARABIC_TEXT.test(consequent) && LATIN_TEXT.test(alternate)) ||
          (LATIN_TEXT.test(consequent) && ARABIC_TEXT.test(alternate));
        if (!isBilingualPair || node.parent?.type === "ConditionalExpression") return;

        let ancestor = node.parent;
        while (ancestor && !/Function/u.test(ancestor.type)) {
          if (ancestor.type === "JSXExpressionContainer" || ancestor.type === "JSXAttribute") {
            context.report({ node, messageId: "inlineCopy" });
            return;
          }
          ancestor = ancestor.parent;
        }

        if (node.parent?.type === "CallExpression") {
          context.report({ node, messageId: "inlineCopy" });
        }
      },
    };
  },
};

const noRolelessAriaLabel = {
  meta: {
    type: "problem",
    docs: { description: "Prevent ignored accessible names on roleless div and span elements" },
    schema: [],
    messages: {
      rolelessLabel:
        "aria-label is ignored on a roleless {{element}}. Add valid semantics or expose equivalent text to assistive technology.",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier" || !["div", "span"].includes(node.name.name)) return;
        const attributes = node.attributes.filter((attribute) => attribute.type === "JSXAttribute");
        const hasAriaLabel = attributes.some(
          (attribute) => attribute.name.type === "JSXIdentifier" && attribute.name.name === "aria-label",
        );
        const hasRole = attributes.some(
          (attribute) => attribute.name.type === "JSXIdentifier" && attribute.name.name === "role",
        );
        if (hasAriaLabel && !hasRole) {
          context.report({ node, messageId: "rolelessLabel", data: { element: node.name.name } });
        }
      },
    };
  },
};

/* ── Token discipline (DEC-069) ───────────────────────────────────────────
   Raw palette classes and arbitrary radii were migrated onto semantic tokens
   in Phase 19. A cleanup without a rule regresses, so these two hold the line.
   Both read the class strings that reach className, including template
   literals and conditional expressions. */

export const RAW_PALETTE_CLASS =
  /\b(?:bg|text|border|ring|from|to|via|fill|stroke|shadow|divide|outline|decoration|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/u;
// rounded-[var(--token)] is the supported escape hatch; a literal length is not.
export const ARBITRARY_RADIUS = /\brounded(?:-[a-z]+)?-\[(?!var\(|inherit)[^\]]+\]/u;

function classStrings(node, out) {
  if (!node) return out;
  if (node.type === "Literal" && typeof node.value === "string") out.push(node.value);
  else if (node.type === "TemplateLiteral") {
    for (const quasi of node.quasis) out.push(quasi.value.cooked ?? quasi.value.raw);
    for (const expression of node.expressions) classStrings(expression, out);
  } else if (node.type === "ConditionalExpression") {
    classStrings(node.consequent, out);
    classStrings(node.alternate, out);
  } else if (node.type === "LogicalExpression") {
    classStrings(node.left, out);
    classStrings(node.right, out);
  } else if (node.type === "ArrayExpression") {
    for (const element of node.elements) classStrings(element, out);
  } else if (node.type === "CallExpression") {
    for (const argument of node.arguments) classStrings(argument, out);
  }
  return out;
}

function makeClassRule({ pattern, messageId, message, description }) {
  return {
    meta: {
      type: "problem",
      docs: { description },
      schema: [],
      messages: { [messageId]: message },
    },
    create(context) {
      const check = (node, valueNode) => {
        for (const value of classStrings(valueNode, [])) {
          if (pattern.test(value)) {
            context.report({ node, messageId });
            return;
          }
        }
      };
      return {
        JSXAttribute(node) {
          if (node.name?.name !== "className") return;
          const value = node.value;
          if (!value) return;
          check(node, value.type === "JSXExpressionContainer" ? value.expression : value);
        },
        Property(node) {
          if (node.key?.name !== "className" && node.key?.value !== "className") return;
          check(node, node.value);
        },
      };
    },
  };
}

const noRawPaletteColor = makeClassRule({
  pattern: RAW_PALETTE_CLASS,
  messageId: "rawPalette",
  description: "Require semantic colour tokens instead of raw Tailwind palette classes",
  message:
    "Use a semantic token (primary, success, warning, info, muted, on-media, sleep, evening) instead of a raw palette colour. Raw palette classes do not follow the theme or the high-contrast and colour-blind modes.",
});

const noArbitraryRadius = makeClassRule({
  pattern: ARBITRARY_RADIUS,
  messageId: "arbitraryRadius",
  description: "Require the documented radius scale instead of arbitrary corner values",
  message:
    "Use the radius scale (rounded-sm/lg/xl/2xl/3xl/full) or rounded-[var(--ds-radius-*)]. Arbitrary pixel radii drift away from the geometry contract in docs/DESIGN_SYSTEM.md.",
});

export const azkarLintRules = {
  rules: {
    "no-inline-bilingual-copy": noInlineBilingualCopy,
    "no-roleless-aria-label": noRolelessAriaLabel,
    "no-raw-palette-color": noRawPaletteColor,
    "no-arbitrary-radius": noArbitraryRadius,
  },
};
