// tweaks.jsx — small in-page tweak controls for portfolio v2.

const { useEffect } = React;

function applyTweaks(t) {
  const r = document.documentElement;
  r.setAttribute('data-accent', t.accent || 'signal-orange');
  document.querySelectorAll('.marquee').forEach(el => {
    el.style.display = t.showMarquees === false ? 'none' : '';
  });
  // accent override via CSS vars
  const accents = {
    'signal-orange': { signal: 'oklch(0.52 0.205 260)', cyan: 'oklch(0.58 0.110 225)' }, /* cobalt + steel teal (default) */
    'electric-cyan': { signal: 'oklch(0.55 0.145 215)', cyan: 'oklch(0.58 0.110 225)' },
    'acid-lime':     { signal: 'oklch(0.55 0.165 145)', cyan: 'oklch(0.52 0.205 260)' },
    'hot-pink':      { signal: 'oklch(0.55 0.205 0)',   cyan: 'oklch(0.58 0.110 225)' },
    'mono':          { signal: 'oklch(0.28 0.014 250)', cyan: 'oklch(0.50 0.014 250)' },
  };
  const a = accents[t.accent] || accents['signal-orange'];
  r.style.setProperty('--signal', a.signal);
  r.style.setProperty('--cyan', a.cyan);
}

function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || {
    accent: 'signal-orange', showMarquees: true, vizDensity: 'normal'
  });

  useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <TweaksPanel>
      <TweakSection label="Accent" />
      <TweakRadio
        label="Color"
        value={t.accent}
        options={[
          { value: 'signal-orange', label: 'Signal'  },
          { value: 'electric-cyan', label: 'Cyan'    },
          { value: 'acid-lime',     label: 'Lime'    },
          { value: 'hot-pink',      label: 'Magenta' },
          { value: 'mono',          label: 'Mono'    },
        ]}
        onChange={(v) => setTweak('accent', v)}
      />

      <TweakSection label="Layout" />
      <TweakToggle
        label="Marquee strips"
        value={t.showMarquees}
        onChange={(v) => setTweak('showMarquees', v)}
      />
    </TweaksPanel>
  );
}

const tweaksHost = document.createElement('div');
document.body.appendChild(tweaksHost);
ReactDOM.createRoot(tweaksHost).render(<App />);
applyTweaks(window.TWEAK_DEFAULTS || {});
