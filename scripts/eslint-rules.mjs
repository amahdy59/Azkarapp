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

export const azkarLintRules = {
  rules: {
    "no-inline-bilingual-copy": noInlineBilingualCopy,
    "no-roleless-aria-label": noRolelessAriaLabel,
  },
};
