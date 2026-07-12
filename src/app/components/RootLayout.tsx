import { Outlet } from "react-router-dom";
import BackButtonHandler from "./BackButtonHandler";

export default function RootLayout() {
  return (
    <>
      <BackButtonHandler />
      <Outlet />
    </>
  );
}
