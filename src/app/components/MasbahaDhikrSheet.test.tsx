import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { MasbahaDhikrSheet } from "./MasbahaDhikrSheet";
import { AUTHENTIC_AZKAR_COLLECTION } from "../content/authenticAzkar";

it("stages the candidate until Continue and keeps saved counts visible", async () => {
  const choose = vi.fn();
  render(
    <MasbahaDhikrSheet
      items={AUTHENTIC_AZKAR_COLLECTION}
      current={AUTHENTIC_AZKAR_COLLECTION[0]!}
      savedItems={{ auth_subhanallah_wabihamdihi: { count: 64, target: 100 } }}
      language="en"
      direction="ltr"
      onContinue={choose}
      onClose={vi.fn()}
    />,
  );
  const user = userEvent.setup();
  expect(screen.getByText("64 / 100")).toBeVisible();
  await user.click(screen.getByTestId("zikr-option-auth_la_hawla_wala_quwwata"));
  expect(choose).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Continue", exact: true }));
  expect(choose).toHaveBeenCalledWith(
    AUTHENTIC_AZKAR_COLLECTION.find((item) => item.id === "auth_la_hawla_wala_quwwata"),
  );
});

it("finds diacritic-free Arabic phrases and provides empty-search recovery without committing", async () => {
  const choose = vi.fn(),
    close = vi.fn();
  render(
    <MasbahaDhikrSheet
      items={AUTHENTIC_AZKAR_COLLECTION}
      current={AUTHENTIC_AZKAR_COLLECTION[0]!}
      savedItems={{}}
      language="ar"
      direction="rtl"
      onContinue={choose}
      onClose={close}
    />,
  );
  const input = screen.getByRole("searchbox");
  fireEvent.change(input, { target: { value: "سبحان الله وبحمده" } });
  expect(screen.getByTestId("zikr-option-auth_subhanallah_wabihamdihi")).toBeVisible();
  fireEvent.change(input, { target: { value: "zzzz" } });
  expect(screen.getByRole("status")).toHaveTextContent("لا يوجد ذكر مأثور يطابق هذا البحث.");
  expect(screen.getByRole("button", { name: "متابعة", exact: true })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "مسح البحث", exact: true }));
  expect(screen.getAllByRole("radio")).toHaveLength(AUTHENTIC_AZKAR_COLLECTION.length);
  await userEvent.click(screen.getByRole("button", { name: "إغلاق", exact: true }));
  expect(close).toHaveBeenCalledOnce();
  expect(choose).not.toHaveBeenCalled();
});
