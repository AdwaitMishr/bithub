import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { WebSocketInitializer } from "./_components/WsInitializer";
import { VoiceChannelUI } from "./_components/VoiceChannelUI";
import { VoiceChatManager } from "./_components/VoiceChatManager";

export const metadata: Metadata = {
  title: "Bithub",
  description: "Bit-sized socializing",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <WebSocketInitializer />
          <VoiceChatManager />
          <VoiceChannelUI />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
