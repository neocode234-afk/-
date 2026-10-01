import { Copy, Sparkles, WandSparkles } from "lucide-react";

export function PromptDimension() {
  return (
    <div className="prompt-dimension relative mx-auto h-[290px] w-full max-w-sm sm:h-[350px] lg:mx-0 lg:max-w-none" aria-hidden="true">
      <div className="prompt-aura" />
      <div className="prompt-orbit prompt-orbit-one" />
      <div className="prompt-orbit prompt-orbit-two" />
      <div className="prompt-deck-card prompt-deck-back"><span>CREATIVE<br />LIBRARY</span></div>
      <div className="prompt-deck-card prompt-deck-middle"><WandSparkles size={26} /><span>IDEAS<br />IN MOTION</span></div>
      <div className="prompt-deck-card prompt-deck-front">
        <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-2xl bg-acid text-ink"><Sparkles size={19} /></span><span className="text-[10px] font-black tracking-[.18em] text-white/55">ALIPROMPT</span></div>
        <div><p className="text-[11px] font-bold text-white/55">PROMPT OF THE MOMENT</p><p className="mt-2 text-2xl font-black leading-8 text-white">خلق کن،<br /><span className="text-acid">متفاوت باش.</span></p></div>
        <div className="flex items-center gap-2 border-t border-white/15 pt-3 text-xs font-bold text-white/80"><Copy size={14} /> آماده برای کپی</div>
      </div>
    </div>
  );
}
