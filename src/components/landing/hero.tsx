"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/core/logo";
import HeroBadge from "../ui/new-badge";
import { ChatInput } from "@/components/chat/chat-input";
import { useRef } from "react";
import { TextShimmer } from "@/shared/ui/shimmer-text";
import type { ChatBubbleHandle } from "@/components/chat/chat-bubble";
import type { RefObject } from "react";

interface HeroProps {
  chatBubbleRef: RefObject<ChatBubbleHandle>;
}

export function Hero({ chatBubbleRef }: HeroProps) {
  const handleHeroSubmit = (message: string) => {
    if (chatBubbleRef.current) {
      chatBubbleRef.current.setIsOpen(true);
      chatBubbleRef.current.handleSend(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0414] text-white flex flex-col relative overflow-x-hidden">
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-40rem] right-[-30rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
      </div>
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-50rem] right-[-50rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem]  bg-linear-90 from-white to-blue-300"></div>
      </div>
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-60rem] right-[-60rem] z-[0] blur-[4rem] skew-[-40deg]  opacity-50">
        <div className="w-[10rem] h-[30rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[30rem]  bg-linear-90 from-white to-blue-300"></div>
        <div className="w-[10rem] h-[30rem]  bg-linear-90 from-white to-blue-300"></div>
      </div>
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <Logo />
          <div className="font-bold text-md">aiii sandbox</div>
        </div>
        <div>
          <button className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm cursor-pointer font-semibold">
            <Link href="/admin">Admin</Link>
          </button> <button className="bg-transparent borer-white border/90 text-white  rounded-full px-4 py-2 text-sm cursor-pointer font-semibold">
            <Link href="/aycl">all you can learn</Link>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex-1 flex justify-center">
            <div className="bg-[#1c1528] rounded-full px-4 py-2 flex items-center gap-2  w-fit mx-4">
              <TextShimmer>yet another ai repo</TextShimmer>
            </div>
          </div>
          {/* Headline */}
          <h1 className="text-5xl font-bold opacity-90 leading-tight">
            mvp turned feature rich   
          </h1>

          <div className="relative max-w-2xl mx-auto w-full">
            <ChatInput 
              placeholder="How can we help you today?" 
              onHeroSubmit={handleHeroSubmit}
            />
          </div>

          {/* Suggestion pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-12 max-w-2xl mx-auto">
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Launch a blog with Astro
            </button>
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Develop an app using NativeScript
            </button>
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Build documentation with Vitepress
            </button>
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Generate UI with shadcn
            </button>
            <button className="bg-[#1c1528] hover:bg-[#2a1f3d] rounded-full px-4 py-2 text-sm">
              Generate UI with HextaUI
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
