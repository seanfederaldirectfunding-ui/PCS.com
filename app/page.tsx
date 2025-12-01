"use client";

import { AuthWrapper } from "../components/auth-wrapper";
import MainApp from "../components/main-app";

export default function Home() {
  return (
    <AuthWrapper>
      <MainApp />
    </AuthWrapper>
  );
}