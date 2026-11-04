/** Сцены стенда работы № 11 (SVG 360×250). Цвета — CSS-переменные или явные rgba для окраски растворов. */
import { L, num } from '../../app/i18n.js';
import { scene, text, hood, hotplate, beaker, thermometer, bubbles, steam, tube, tubeRack, bottle } from '../../app/scene/svg.js';

/** Координаты пробирок так же, как в базовом шаге test. */
export function tubeXs(n) {
  return n === 1 ? [180] : n === 2 ? [140, 220] : n === 3 ? [110, 180, 250] : Array.from({ length: n }, (_, i) => 80 + (i * 200) / (n - 1));
}

/** Фон для шагов test: подпись температуры кипящей бани, пар над только что нагретыми пробирками. */
export function benchBack(ids) {
  return (S, local) => {
    let s = '';
    const xs = tubeXs(ids.length);
    if (S.bath) {
      const T = S.bath.T;
      s += `<rect class="met" x="8" y="8" width="92" height="30" rx="5" opacity=".9"/><rect x="12" y="12" width="84" height="22" rx="3" fill="var(--screen)"/>`;
      s += `<text x="54" y="27" text-anchor="middle" class="mono" style="fill:var(--screen-ink);font-size:11px">${T >= 99.5 ? '100' : num(T, 0)} °C</text>`;
      s += text(54, 50, T >= 97 ? L('баня кипит', 'монша қайнап тұр', 'bath boiling') : L('баня греется', 'монша қызуда', 'bath heating'), 'lbl');
    }
    ids.forEach((id, i) => { const t = local.tubes && local.tubes[id]; if (t && t.hot) s += steam(xs[i], 30, true); });
    return s;
  };
}

/** Вытяжной шкаф со штативом пробирок (подготовка рабочего места). */
export function hoodScene(S, local) {
  const air = !!(local.on && local.on.hood);
  return scene(hood({ air, extra: tubeRack(232, 300) + [244, 266, 288].map((x, i) => tube({ id: 'h' + i, cx: x, top: 162, len: 52, r: 6, frac: 0 })).join('') }));
}

/** Водяная баня: стакан с водой на электроплитке, термометр. */
export function bathScene(S, lc) {
  const b = S.bath || { T: 22, water: false, on: false };
  const T = b.T;
  const boil = b.water && T >= 99;
  let inner = '';
  if (boil) inner += bubbles(140, 186, 80, 8);
  else if (b.water && T > 85) inner += bubbles(160, 188, 40, 3);
  let s = hotplate({ x: 100, y: 198, w: 160, on: !!(lc.c && lc.c.plate) });
  s += beaker({ id: 'wb', x: 124, y: 84, w: 112, hh: 108, frac: b.water ? 0.72 : 0, cap: 250, marks: [100, 200], inner });
  s += text(20, 40, L('баня: стакан 250 мл на плитке', 'монша: плитадағы 250 мл стақан', 'bath: 250 mL beaker on the hot plate'), 'lbl', 'start');
  if (b.water) s += steam(180, 76, T > 80);
  s += thermometer({ x: 214, top: 30, hh: 150, T, min: 0, max: 110, step: 10, major: 20 });
  s += text(300, 70, `${T >= 99.5 ? '100' : num(T, 0)} °C`, 'lblb mono');
  return scene(s, L('Водяная баня на плитке', 'Плитадағы су моншасы', 'Water bath on a hot plate'));
}

/** Нагревание пробирки в держателе над плиткой (реакция Фоля): направление отверстия, кипение, потемнение. */
export function fohlScene(S, lc) {
  const f = S.f5 || {};
  const on = !!(lc.c && lc.c.heat);
  const aim = lc.c && lc.c.aim;
  const rot = aim === 'me' ? -38 : aim === 'nb' ? 38 : 14;
  const dark = Math.min(1, (f.boil || 0) / 150);
  const color = `rgba(${Math.round(236 - 170 * dark)},${Math.round(232 - 186 * dark)},${Math.round(214 - 186 * dark)},${(0.45 + 0.4 * dark).toFixed(2)})`;
  const boiling = (f.T || 22) >= 103 && on;
  const a = (rot * Math.PI) / 180, mx = 180 + 106 * Math.sin(a), my = 176 - 106 * Math.cos(a);
  let s = `<rect x="10" y="8" width="340" height="224" rx="8" fill="none" stroke="var(--metal)" stroke-width="3"/>` + text(20, 26, L('вытяжной шкаф · тяга включена', 'тартпа шкаф · тартым қосулы', 'fume hood · airflow on'), 'lbl', 'start');
  s += hotplate({ x: 120, y: 198, w: 120, on });
  s += `<g transform="rotate(${rot} 180 176)">${tube({ id: 'fh', cx: 180, top: 70, len: 100, r: 9, frac: 0.42, color, ppt: dark > 0.3 ? dark : 0, pptColor: '#2b1d14', gas: boiling })}`;
  s += `<rect x="170" y="${lc.done && lc.done.holder ? 92 : 300}" width="20" height="9" rx="2" fill="#a0703c"/><rect x="186" y="${lc.done && lc.done.holder ? 94 : 300}" width="70" height="5" rx="2" fill="#a0703c"/></g>`;
  if (boiling) s += steam(mx, my - 4, true);
  s += text(70, 222, L('вы', 'сіз', 'you'), 'lblb') + `<circle cx="70" cy="196" r="9" fill="var(--muted)" opacity=".5"/><rect x="60" y="205" width="20" height="10" rx="4" fill="var(--muted)" opacity=".5"/>`;
  s += text(290, 222, L('сосед', 'көрші', 'neighbour'), 'lblb') + `<circle cx="290" cy="196" r="9" fill="var(--muted)" opacity=".5"/><rect x="280" y="205" width="20" height="10" rx="4" fill="var(--muted)" opacity=".5"/>`;
  s += text(296, 60, `${num(f.T || 22, 0)} °C`, 'lblb mono', 'end');
  return scene(s, L('Нагревание пробирки над плиткой в вытяжном шкафу', 'Тартпа шкафта пробирканы плита үстінде қыздыру', 'Heating a test tube over a hot plate in the fume hood'));
}

/** Плитка с кипящей баней и склянка этанола (выбор места работы с ЛВЖ). */
export function ethanolScene(S, local) {
  let s = hotplate({ x: 40, y: 198, w: 130, on: true });
  s += beaker({ id: 'eb', x: 60, y: 110, w: 90, hh: 82, frac: 0.7, cap: 250, inner: bubbles(70, 186, 70, 6) }) + steam(105, 104, true);
  s += text(105, 100, L('кипящая баня', 'қайнап тұрған монша', 'boiling bath'));
  s += bottle(250, L('этанол', 'этанол', 'ethanol'), '96 %');
  s += `<path d="M232 206 l-8 -12 l8 4 l2 -10 l4 12 z" fill="var(--hot)" opacity="${local.chosen === 'plate' ? 0.9 : 0}"/>`;
  s += text(273, 98, L('ЛВЖ', 'ТЖС', 'flammable'), 'lbl');
  return scene(s, L('Плитка и склянка с этанолом', 'Плита және этанол құтысы', 'Hot plate and ethanol bottle'));
}

/** Пробирки после нингидриновой пробы (выбор: мыть или нет). */
export function washScene(S, local) {
  let s = tubeRack(80, 280);
  s += tube({ id: 'w1', cx: 140, frac: 0.25, color: 'rgba(92,38,168,.75)', label: L('глицин', 'глицин', 'glycine') });
  s += tube({ id: 'w2', cx: 220, frac: 0.25, color: 'rgba(92,38,168,.6)', label: L('белок', 'ақуыз', 'egg white') });
  s += text(180, 24, L('пробирки после опыта 2', '2-тәжірибеден кейінгі пробиркалар', 'tubes after experiment 2'), 'lbl');
  return scene(s);
}
