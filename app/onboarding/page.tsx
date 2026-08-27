'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/hooks/useI18n';

/* ────────────────────────────────────────────────────────────
   CongoConnect Onboarding — language + country + preferences
   Stage 1: choose language   Stage 2: country    Stage 3: done
   ──────────────────────────────────────────────────────────── */

const STAGES = [
  { id: 'lang', label: 'Language' },
  { id: 'country', label: 'Country' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🏴' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'ln', label: 'Lingala', native: 'Lingala', flag: '🇩🇯', note: 'Growing' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili', flag: '🇹🇿', note: 'Growing' },
  { code: 'lu', label: 'Tshiluba', native: 'Tshiluba', flag: '', note: 'Coming' },
  { code: 'kg', label: 'Kikongo', native: 'Kikongo', flag: '', note: 'Coming' },
];

const COUNTRIES = [
  { code: 'cd', label: 'Democratic Republic of the Congo', short: 'DRC', flag: '🇨🇩' },
  { code: 'cg', label: 'Republic of the Congo', short: 'Congo-Brazzaville', flag: '🇨🇬' },
  { code: 'cd', label: 'Democratic Republic of the Congo', short: 'DRC', flag: '🇨🇩' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const [stage, setStage] = useState(0);
  const [lang, setLang] = useState(locale);
  const [country, setCountry] = useState('cd');
  const [notif, setNotif] = useState(true);
  const [bigText, setBigText] = useState(false);
  const [animating, setAnimating] = useState(false);

  const goNext = () => {
    if (stage < STAGES.length - 1) setStage((s) => s + 1);
  };
  const goBack = () => {
    if (stage > 0) setStage((s) => s - 1);
  };

  const finish = () => {
    setAnimating(true);
    setLocale(lang);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  const current = STAGES[stage];

  return (
    <main className="relative min-h-screen bg-cream overflow-hidden">

      {/* ── Background globe watermark ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-30">
        <GlobeWaterMark />
      </div>

      {/* ── Progress bar ── */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-cc-charcoal-200/40">
        <div className="mx-auto max-w-sm px-4 py-4">
          <div className="flex items-center justify-between">
            {STAGES.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  i <= stage ? 'bg-cc-gold-300' : 'bg-cc-charcoal-200'
                }`}/>
                {i < STAGES.length - 1 && <div className="h-0.5 w-4 rounded bg-cc-charcoal-200"/>}
              </div>
            ))}
          </div>
          <p className={`mt-2 text-xs font-medium ${
            stage === 0 ? 'text-cc-blue-500' : 'text-cc-charcoal-500'
          }`}>
            Step {stage + 1} of {STAGES.length}: {current.label}
          </p>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="mx-auto max-w-sm px-4 py-8 sm:py-12">
        <div className="rounded-2xl bg-white shadow-card shadow-float p-6 sm:p-8 transition-all duration-300">

          {/* Stage 0: Language */}
          {stage === 0 && (
            <div className={`space-y-5 ${animating ? 'animate-fade-up' : ''}`}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cc-blue-50">
                  <svg className="h-6 w-6 text-cc-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 6.6 6.6 0 0 1-4 6 6.6 6.6 0 0 1-4-6 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-bold text-cc-blue-500">Choose your language</h2>
                <p className="mt-1.5 text-sm text-cc-charcoal-500">
                  We will show the app in this language.
                </p>
              </div>

              <div className="space-y-2">
                {LANGUAGES.map((l) => {
                  const selected = lang === l.code;
                  const disabled = l.note === 'Coming';
                  return (
                    <button type="button"
          key={l.code}
                      onClick={() => !disabled && setLang(l.code)}
                      className={`w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 ${
                        selected
                          ? 'bg-cc-blue-50 border-2 border-cc-blue-500 shadow-sm shadow-cc-blue-500/15'
                          : disabled
                          ? 'bg-cc-charcoal-50 border border-cc-charcoal-200/40 cursor-not-allowed opacity-60'
                          : 'bg-white border border-cc-charcoal-200/40 hover:border-cc-blue-300 hover:shadow-sm'
                      }`}
                      disabled={disabled}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        selected ? 'bg-cc-blue-500 text-white' : 'bg-cc-charcoal-100 text-cc-charcoal-600'
                      }`}>
                        {l.flag || <span className="text-lg">🌐</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${
                            selected ? 'text-cc-blue-500' : 'text-cc-charcoal-900'
                          }`}>{l.label}</p>
                          {disabled && (
                            <span className="rounded-full bg-cc-charcoal-200 px-1.5 py-0.5 text-[10px] font-semibold text-cc-charcoal-500">
                              Soon
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-cc-charcoal-500">{l.native}</p>
                      </div>
                      {selected && (
                        <svg className="h-5 w-5 text-cc-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <Link href="/" className="btn-ghost flex-1 py-2.5 rounded-lg text-sm">
                  Skip
                </Link>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 btn-primary py-2.5 rounded-lg bg-cc-blue-500 hover:bg-cc-blue-600 hover:shadow-md hover:shadow-cc-blue-500/20 transition-all duration-200"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Stage 1: Country */}
          {stage === 1 && (
            <div className={`space-y-5 ${animating ? 'animate-fade-up' : ''}`}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cc-blue-50">
                  <svg className="h-6 w-6 text-cc-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M3 21h18M5 21V7l8 4 8-4v14M9 11h10"/>
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-bold text-cc-blue-500">Where are you based?</h2>
                <p className="mt-1.5 text-sm text-cc-charcoal-500">
                  We'll tailor prices, currencies, and local payment methods.
                </p>
              </div>

              <div className="space-y-2">
                {COUNTRIES.map((c) => {
                  const selected = country === c.code;
                  return (
                    <button type="button"
          key={c.code}
                      onClick={() => setCountry(c.code)}
                      className={`w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 ${
                        selected
                          ? 'bg-cc-blue-50 border-2 border-cc-blue-500 shadow-sm shadow-cc-blue-500/15'
                          : 'bg-white border border-cc-charcoal-200/40 hover:border-cc-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        selected ? 'bg-cc-blue-500 text-white' : 'bg-cc-charcoal-100 text-cc-charcoal-600'
                      }`}>
                        <span className="text-lg">{c.flag}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold ${
                          selected ? 'text-cc-blue-500' : 'text-cc-charcoal-900'
                        }`}>{c.label}</p>
                        <p className="text-xs text-cc-charcoal-500">{c.short}</p>
                      </div>
                      {selected && (
                        <svg className="h-5 w-5 text-cc-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Preferences */}
              <div className="rounded-xl border border-cc-charcoal-200/40 p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-cc-charcoal-500">Preferences</h4>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-cc-charcoal-900">Push notifications for trip updates</span>
                  <button type="button"
                    onClick={() => setNotif(!notif)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      notif ? 'bg-cc-blue-500' : 'bg-cc-charcoal-300'
                    }`}
                    role="switch"
                    aria-checked={notif}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      notif ? 'translate-x-5' : 'translate-x-0.5'
                    }`}/>
                  </button>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-cc-charcoal-900">Large text mode</span>
                  <button type="button"
                    onClick={() => setBigText(!bigText)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      bigText ? 'bg-cc-blue-500' : 'bg-cc-charcoal-300'
                    }`}
                    role="switch"
                    aria-checked={bigText}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      bigText ? 'translate-x-5' : 'translate-x-0.5'
                    }`}/>
                  </button>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={goBack} className="btn-secondary flex-1 py-2.5 rounded-lg">
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={finish}
                  className="flex-1 btn-primary py-2.5 rounded-lg bg-cc-blue-500 hover:bg-cc-blue-600 hover:shadow-md hover:shadow-cc-blue-500/20 transition-all duration-200"
                >
                  Finish setup →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Done state ── */}
        {animating && (
          <div className="mt-6 text-center animate-fade-in">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 text-2xl">
              ✓
            </div>
            <p className="mt-3 text-sm text-cc-charcoal-500 animate-fade-up">
              Setting up your CongoConnect account…
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

/* ── Globe watermark ── */
function GlobeWaterMark() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    const THREE = (window as any).THREE;
    if (!THREE) return;

    const w = mount.clientWidth || 400;
    const h = mount.clientHeight || 300;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    const globe = new THREE.Group();
    scene.add(globe);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x0B2545, wireframe: true, transparent: true, opacity: 0.06 }),
    );
    globe.add(wire);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(2.48, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x060F1F, transparent: true, opacity: 0.08 }),
    );
    globe.add(core);

    let raf: number;
    const animate = () => {
      globe.rotation.y += 0.0015;
      globe.rotation.x = 0.35 + Math.sin(Date.now() * 0.00008) * 0.05;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} className="h-48 w-full opacity-30"/>;
}
