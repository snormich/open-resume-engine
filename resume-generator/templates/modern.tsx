import { ResumeData } from '@/lib/types';

type Props = {
  data: ResumeData;
  qrDataUrl?: string;
};

export function ModernTemplate({ data, qrDataUrl }: Props) {
  return (
    <article className="mx-auto grid max-w-4xl gap-8 bg-white p-8 text-black md:grid-cols-[2fr_1fr]">
      <section className="space-y-6">
        <header className="border-b border-black pb-4">
          <h1 className="text-4xl font-bold">{data.basics.name}</h1>
          <p className="mt-1 text-lg">{data.basics.title}</p>
          <p className="mt-2 text-sm">
            {data.basics.email} · {data.basics.phone} · {data.basics.location}
          </p>
        </header>

        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em]">Summary</h2>
          <p className="text-sm leading-6">{data.basics.summary}</p>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em]">Experience</h2>
          <div className="space-y-5">
            {data.experience.map((exp, index) => (
              <div key={`${exp.company}-${index}`}>
                <p className="font-semibold">
                  {exp.role} — {exp.company}
                </p>
                <p className="text-xs text-neutral-700">
                  {exp.start} - {exp.end}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
                  {exp.highlights.map((highlight, hIndex) => (
                    <li key={`${highlight}-${hIndex}`}>{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-6 border-l border-black pl-6">
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em]">Education</h2>
          <div className="space-y-2 text-sm">
            {data.education.map((item, index) => (
              <p key={`${item.institution}-${index}`}>
                <span className="font-semibold">{item.degree}</span>
                <br />
                {item.institution} ({item.year})
              </p>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em]">Skills</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {data.skills.map((skill, index) => (
              <li key={`${skill.name}-${index}`}>
                {skill.name} <span className="text-neutral-700">({skill.level})</span>
              </li>
            ))}
          </ul>
        </div>

        {qrDataUrl ? (
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em]">QR</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR de contacto" className="h-28 w-28 border border-black p-1" />
          </div>
        ) : null}
      </aside>
    </article>
  );
}
