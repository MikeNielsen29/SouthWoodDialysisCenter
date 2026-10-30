import { Reveal } from '@/components/ui/reveal'

interface PageHeaderProps {
  eyebrow: string
  title: string
  emphasis?: string
  lead?: string
}

export function PageHeader({ eyebrow, title, emphasis, lead }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_100%_0%,#EDE4D6_0%,transparent_60%),radial-gradient(80%_60%_at_0%_100%,#DCECE7_0%,transparent_65%)]"
      />
      <div className="shell relative py-14 sm:py-16 lg:py-20">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="display mt-5 text-balance text-[34px] leading-[1.08] sm:text-[46px]">
            {title}
            {emphasis && <span className="italic text-brand-700">{emphasis}</span>}
          </h1>
          {lead && <p className="lead mt-5 max-w-xl">{lead}</p>}
        </Reveal>
      </div>
    </section>
  )
}
