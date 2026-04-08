import { ResumeData } from '@/lib/types';

type Props = {
  data: ResumeData;
  qrDataUrl?: string;
};

export function MinimalTemplate({ data, qrDataUrl }: Props) {
  return (
    <article className="mx-auto max-w-3xl space-y-8 bg-white p-8 text-black">
      <header className="space-y-2 border-b border-black pb-4">
        <h1 className="text-3xl font-semibold tracking-tight">{data.basics.name}</h1>
        <p className="text-lg">{data.basics.title}</p>
        <p className="text-sm">
          {data.basics.email} · {data.basics.phone} · {data.basics.location}
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Summary</h2>
        <p className="text-sm leading-6">{data.basics.summary}</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={`${exp.company}-${index}`}>
              <p className="text-sm font-semibold">
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
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Education</h2>
        <div className="space-y-2 text-sm">
          {data.education.map((item, index) => (
            <p key={`${item.institution}-${index}`}>
              <span className="font-semibold">{item.degree}</span> — {item.institution} ({item.year})
            </p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">Skills</h2>
        <p className="text-sm">{data.skills.map((skill) => `${skill.name} (${skill.level})`).join(', ')}</p>
      </section>

      {qrDataUrl ? (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide">QR</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR de contacto" className="h-28 w-28 border border-black p-1" />
        </section>
      ) : null}
    </article>
  );
}
