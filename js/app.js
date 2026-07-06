(function () {
  'use strict';

  var KEY = 'sachil-tracker-v2';
  var STAMP_GOAL = 7;

  var SHOW = {
    period: '2026.08.04 – 2026.10.25',
    venue: '링크아트센터 드림 2관',
    roles: [
      { key: 'jungwon', name: '안정원', tagline: '나는 무엇을 잊고 있는가', cast: ['황민수', '선한국', '김찬종'] },
      { key: 'yijun', name: '강이준', tagline: '누구 잘못도 아니야', cast: ['임태현', '박정혁', '김재한'] }
    ],
    performances: [
      { date: '08.04', dow: '화', time: '20:00', jungwon: '김찬종', yijun: '박정혁', badge: '첫공' },
      { date: '08.05', dow: '수', time: '20:00', jungwon: '선한국', yijun: '김재한', badge: '첫공' },
      { date: '08.06', dow: '목', time: '20:00', jungwon: '황민수', yijun: '임태현', badge: '첫공' },
      { date: '08.07', dow: '금', time: '20:00', jungwon: '선한국', yijun: '박정혁' },
      { date: '08.08', dow: '토', time: '15:00', jungwon: '김찬종', yijun: '김재한' },
      { date: '08.08', dow: '토', time: '19:00', jungwon: '선한국', yijun: '김재한' },
      { date: '08.09', dow: '일', time: '14:00', jungwon: '황민수', yijun: '박정혁' },
      { date: '08.09', dow: '일', time: '18:00', jungwon: '김찬종', yijun: '임태현' },
      { date: '08.11', dow: '화', time: '20:00', jungwon: '선한국', yijun: '임태현' },
      { date: '08.12', dow: '수', time: '16:00', jungwon: '김찬종', yijun: '박정혁' },
      { date: '08.12', dow: '수', time: '20:00', jungwon: '황민수', yijun: '김재한' },
      { date: '08.13', dow: '목', time: '20:00', jungwon: '선한국', yijun: '임태현' },
      { date: '08.14', dow: '금', time: '20:00', jungwon: '황민수', yijun: '김재한' },
      { date: '08.15', dow: '토', time: '15:00', jungwon: '선한국', yijun: '임태현' },
      { date: '08.15', dow: '토', time: '19:00', jungwon: '김찬종', yijun: '김재한' },
      { date: '08.16', dow: '일', time: '14:00', jungwon: '황민수', yijun: '박정혁' },
      { date: '08.16', dow: '일', time: '18:00', jungwon: '김찬종', yijun: '박정혁' },
      { date: '08.17', dow: '월', time: '14:00', jungwon: '선한국', yijun: '임태현' },
      { date: '08.17', dow: '월', time: '18:00', jungwon: '황민수', yijun: '김재한' },
      { date: '08.19', dow: '수', time: '16:00', jungwon: '황민수', yijun: '박정혁' },
      { date: '08.19', dow: '수', time: '20:00', jungwon: '김찬종', yijun: '박정혁' },
      { date: '08.20', dow: '목', time: '20:00', jungwon: '김찬종', yijun: '임태현' },
      { date: '08.21', dow: '금', time: '20:00', jungwon: '선한국', yijun: '김재한' },
      { date: '08.22', dow: '토', time: '15:00', jungwon: '김찬종', yijun: '임태현' },
      { date: '08.22', dow: '토', time: '19:00', jungwon: '선한국', yijun: '박정혁' },
      { date: '08.23', dow: '일', time: '14:00', jungwon: '황민수', yijun: '김재한' },
      { date: '08.23', dow: '일', time: '18:00', jungwon: '황민수', yijun: '임태현' }
    ],
    tiers: [
      { count: 5, name: '지정 폴라로이드 1매', desc: '원하는 배우 지정 후 수령' },
      { count: 7, name: '실황 OST', desc: '공연 실황 음원' }
    ]
  };

  function perfId(p) { return p.date + '_' + p.time; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function defaultBoards() {
    return [];
  }

  function loadState() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    var boards = (s && s.boards && s.boards.length) ? s.boards : defaultBoards();
    return {
      tab: 'schedule',
      activeActor: (s && s.pinnedActor) || null,
      pinnedActor: (s && s.pinnedActor) || null,
      watched: (s && s.watched) || {},
      seats: (s && s.seats) || {},
      boards: boards,
      nextBoardSeq: (s && s.nextBoardSeq) || (boards.length + 1),
      boardView: 'list',
      currentBoardId: boards[0] ? boards[0].id : null,
      modalOpen: false,
      modalBoardId: null,
      openMenuBoardId: null,
      mfDate: '', mfActor: '', mfEditIdx: null,
      toast: null
    };
  }

  var state = loadState();
  var toastTimer = null;

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        watched: state.watched, seats: state.seats, pinnedActor: state.pinnedActor,
        boards: state.boards, nextBoardSeq: state.nextBoardSeq
      }));
    } catch (e) {}
  }

  function update(patch) {
    Object.assign(state, patch);
    persist();
    render();
  }
  function setState(patch) { Object.assign(state, patch); render(); }

  function showToast(msg) {
    state.toast = msg;
    render();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { state.toast = null; render(); }, 1800);
  }

  function toggleWatch(id) {
    var w = Object.assign({}, state.watched);
    if (w[id]) delete w[id]; else w[id] = true;
    update({ watched: w });
  }
  function setSeat(id, raw) {
    var val = (raw || '').trim().toUpperCase();
    var s = Object.assign({}, state.seats);
    var w = Object.assign({}, state.watched);
    if (val) { s[id] = val; w[id] = true; } else { delete s[id]; }
    update({ seats: s, watched: w });
  }
  function setActor(name) {
    var p = state.activeActor === name ? null : name;
    update({ activeActor: p, pinnedActor: p });
  }
  function togglePin(name) {
    var p = state.pinnedActor === name ? null : name;
    update({ pinnedActor: p, activeActor: p });
  }
  function clearFilter() { update({ activeActor: null, pinnedActor: null }); }
  function setTab(t) { setState({ tab: t }); }

  function copySeat(code) {
    try { navigator.clipboard && navigator.clipboard.writeText(code); } catch (e) {}
    showToast(code + ' 복사됨');
  }
  function seatTap(code, cnt) { showToast(cnt > 0 ? code + ' · 관람 ' + cnt + '회' : code + ' · 기록 없음'); }

  function exportData() {
    var data = JSON.stringify({ watched: state.watched, seats: state.seats, pinnedActor: state.pinnedActor, boards: state.boards }, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'sachil-tracker.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('데이터를 저장했어요');
  }
  function saveNodeAsJpeg(nodeId, filename) {
    if (typeof html2canvas === 'undefined') { showToast('이미지 모듈을 불러오지 못했어요. 새로고침 후 다시 시도해주세요'); return; }
    if (!document.getElementById(nodeId)) { showToast('저장할 영역을 찾지 못했어요'); return; }
    showToast('이미지를 만드는 중…');
    var errMsg = function (e) { return e && e.message ? e.message : String(e); };
    var run = function () {
      // showToast가 render()로 #app을 다시 그리므로, 재렌더 이후 최신 노드를 다시 조회해야
      // 분리된(detached) 노드를 캡처하다 "Unable to find element in cloned iframe"가 나는 것을 막는다.
      var node = document.getElementById(nodeId);
      if (!node) { showToast('저장할 영역을 찾지 못했어요'); return; }
      html2canvas(node, {
        backgroundColor: '#080504',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 8000
      }).then(function (canvas) {
        var url;
        try { url = canvas.toDataURL('image/jpeg', 0.92); }
        catch (e) { showToast('이미지 변환 실패: ' + errMsg(e)); return; }
        var a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        showToast('이미지를 저장했어요');
      }).catch(function (e) { showToast('이미지 저장 실패: ' + errMsg(e)); });
    };
    // 웹폰트가 준비된 뒤 캡처해야 글자 레이아웃이 정확함
    if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
      document.fonts.ready.then(run, run);
    } else { run(); }
  }
  function saveImage() { saveNodeAsJpeg('settle-capture', '사칠-정산.jpg'); }
  function saveStampImage() { saveNodeAsJpeg('stamp-capture', '사칠-적립.jpg'); }
  function triggerImport() { var el = document.getElementById('sachil-import'); if (el) el.click(); }
  function importData(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        update({
          watched: d.watched || {}, seats: d.seats || {}, pinnedActor: d.pinnedActor || null,
          activeActor: d.pinnedActor || null,
          boards: (d.boards && d.boards.length) ? d.boards : state.boards
        });
        showToast('데이터를 불러왔어요');
      } catch (err) { showToast('불러오기에 실패했어요'); }
    };
    r.readAsText(f);
    e.target.value = '';
  }
  function resetData() {
    if (!confirm('모든 관람 기록을 초기화할까요?')) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    var boards = [];
    state.watched = {}; state.seats = {}; state.pinnedActor = null; state.activeActor = null;
    state.boards = boards; state.nextBoardSeq = 1; state.currentBoardId = null; state.boardView = 'list';
    state.openMenuBoardId = null;
    persist();
    render();
    showToast('초기화했어요');
  }

  function normSeat(v) {
    var m = (v || '').toUpperCase().match(/([A-L]).*?(\d+)/);
    return m ? m[1] + m[2] : null;
  }

  function rng(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }

  function buildSeatRows(seatCount) {
    var defs = [
      { row: 'A', pad: 1, left: rng(1, 10), right: rng(11, 20) },
      { row: 'B', pad: 1, left: rng(1, 10), right: rng(11, 19) },
      { row: 'C', pad: 1, left: rng(1, 10), right: rng(11, 20) },
      { row: 'D', pad: 1, left: rng(1, 10), right: rng(11, 19) },
      { row: 'E', pad: 0, alignRight: true, left: rng(1, 7), right: rng(8, 17), entrance: true, gap: true },
      { row: 'F', pad: 0, alignRight: true, left: rng(1, 7), right: rng(8, 17) },
      { row: 'G', pad: 0, alignRight: true, left: rng(1, 7), right: rng(8, 17) },
      { row: 'H', pad: 0, alignRight: true, left: rng(1, 9), right: rng(10, 19) },
      { row: 'I', pad: 0, alignRight: true, left: rng(1, 9), right: rng(10, 19) },
      { row: 'J', pad: 0, alignRight: true, left: [1, 2, 'g', 3, 4, 5, 6, 7, 8, 9], right: rng(10, 19) },
      { row: 'K', pad: 0, alignRight: true, left: [1, 2, 'g', 3, 4, 5, 6, 7, 8, 9], right: rng(10, 18) },
      { row: 'L', center: rng(1, 7), gap: true }
    ];
    function mkSeat(row, num) {
      var code = row + num;
      var cnt = seatCount[code] || 0;
      return { isSpacer: false, num: String(num), code: code, logged: cnt > 0, plain: cnt === 0, count: cnt };
    }
    function spacer() { return { isSpacer: true, logged: false, plain: false, num: '', code: '' }; }
    return defs.map(function (d) {
      if (d.center) {
        return { isL: true, notL: false, letter: 'L', topGap: '0px', center: d.center.map(function (n) { return mkSeat('L', n); }) };
      }
      var leftItems = [];
      for (var i = 0; i < d.pad; i++) leftItems.push(spacer());
      d.left.forEach(function (x) { leftItems.push(x === 'g' ? spacer() : mkSeat(d.row, x)); });
      return {
        isL: false, notL: true, letter: d.row, entrance: !!d.entrance,
        topGap: d.gap ? '10px' : '0px', alignRight: !!d.alignRight,
        leftItems: leftItems, rightItems: d.right.map(function (n) { return mkSeat(d.row, n); })
      };
    });
  }

  function findBoard(id) { return state.boards.filter(function (b) { return b.id === id; })[0]; }

  function addBoard() {
    var id = state.nextBoardSeq;
    var board = { id: id, name: String(id), stamps: [], claims: {} };
    update({ boards: state.boards.concat([board]), nextBoardSeq: id + 1 });
    showToast('새 도장판을 추가했어요');
  }
  function openBoard(id) { setState({ currentBoardId: id, boardView: 'detail', openMenuBoardId: null }); }
  function closeBoard() { setState({ boardView: 'list' }); }
  function toggleBoardMenu(id) { setState({ openMenuBoardId: state.openMenuBoardId === id ? null : id }); }
  function deleteBoard(id) {
    var boards = state.boards.filter(function (b) { return b.id !== id; });
    var patch = { boards: boards, openMenuBoardId: null };
    if (state.currentBoardId === id) { patch.currentBoardId = boards[0] ? boards[0].id : null; patch.boardView = 'list'; }
    update(patch);
    showToast('도장판을 삭제했어요');
  }

  function openStampModal(boardId) {
    var board = findBoard(boardId);
    if (!board || board.stamps.length >= STAMP_GOAL) return;
    setState({ modalOpen: true, modalBoardId: boardId, mfDate: '', mfActor: '', mfEditIdx: null });
  }
  function openStampEdit(boardId, idx, stamp) {
    setState({ modalOpen: true, modalBoardId: boardId, mfDate: stamp.date || '', mfActor: stamp.actor || '', mfEditIdx: idx });
  }
  function closeModal() { setState({ modalOpen: false, modalBoardId: null, mfEditIdx: null }); }
  function selectStampActor(name) { setState({ mfActor: state.mfActor === name ? '' : name }); }

  function submitStamp() {
    if (!state.mfDate || !state.mfDate.trim()) { showToast('관람일을 입력해주세요'); return; }
    if (!state.mfActor) { showToast('적립 도장 이미지를 선택해주세요'); return; }
    var editIdx = state.mfEditIdx;
    var newStamp = { date: state.mfDate.trim(), actor: state.mfActor };
    var boards = state.boards.map(function (b) {
      if (b.id !== state.modalBoardId) return b;
      var stamps;
      if (editIdx != null) {
        stamps = b.stamps.map(function (s, i) { return i === editIdx ? newStamp : s; });
      } else {
        stamps = b.stamps.concat([newStamp]);
      }
      return Object.assign({}, b, { stamps: stamps });
    });
    update({ boards: boards, modalOpen: false, modalBoardId: null, mfEditIdx: null });
    showToast(editIdx != null ? '도장을 수정했어요' : '도장을 적립했어요');
  }

  function deleteStamp() {
    var editIdx = state.mfEditIdx;
    if (editIdx == null) return;
    var boards = state.boards.map(function (b) {
      if (b.id !== state.modalBoardId) return b;
      return Object.assign({}, b, { stamps: b.stamps.filter(function (s, i) { return i !== editIdx; }) });
    });
    update({ boards: boards, modalOpen: false, modalBoardId: null, mfEditIdx: null });
    showToast('도장을 삭제했어요');
  }

  function tapStamp(boardId, idx, stamp) {
    if (stamp) { openStampEdit(boardId, idx, stamp); return; }
    var board = findBoard(boardId);
    if (board && idx === board.stamps.length) openStampModal(boardId);
  }

  function claimTier(boardId, tierCount) {
    var boards = state.boards.map(function (b) {
      if (b.id !== boardId) return b;
      var claims = Object.assign({}, b.claims);
      claims[tierCount] = true;
      return Object.assign({}, b, { claims: claims });
    });
    update({ boards: boards });
    showToast('혜택을 수령했어요');
  }

  function boardStatus(board) {
    var count = board.stamps.length;
    var achievedUnclaimed = SHOW.tiers.some(function (t) { return count >= t.count && !board.claims[t.count]; });
    var anyAchieved = SHOW.tiers.some(function (t) { return count >= t.count; });
    if (achievedUnclaimed) return { status: '수령 가능', color: '#ffb877', icon: '🎁' };
    if (anyAchieved) return { status: '수령완료', color: '#9fdcae', icon: '✓' };
    return { status: '적립 중', color: 'rgba(232,205,190,.5)', icon: '●' };
  }

  // ---------- RENDER ----------

  function renderHeader() {
    return '' +
      '<header style="position:relative; z-index:1; padding:26px 22px 16px; text-align:center;">' +
      '  <div style="font-family:\'Cinzel\',serif; font-size:10px; letter-spacing:6px; color:rgba(232,205,190,.55); font-weight:500;">MUSICAL</div>' +
      '  <img src="img/name.png" alt="사칠" style="display:block; margin:8px auto 6px; width:auto; max-width:45%; height:auto;" />' +
      '  <div style="margin-top:12px; display:flex; flex-direction:column; gap:2px; font-size:11.5px; color:rgba(232,205,190,.62); letter-spacing:.2px;">' +
      '    <span>' + esc(SHOW.period) + '</span>' +
      '    <span>' + esc(SHOW.venue) + '</span>' +
      '  </div>' +
      '</header>';
  }

  function renderEmbers() {
    var specs = [
      { left: '12%', size: 4, colors: '#ffb060,#e0431f', blur: '.4px', dur: '7s', delay: '0s' },
      { left: '34%', size: 3, colors: '#ffcf8a,#e0431f', blur: '', dur: '9s', delay: '1.4s' },
      { left: '58%', size: 5, colors: '#ffa64d,#c8360f', blur: '.6px', dur: '8s', delay: '2.6s' },
      { left: '76%', size: 3, colors: '#ffd08a,#e0431f', blur: '', dur: '10s', delay: '3.8s' },
      { left: '88%', size: 4, colors: '#ffb060,#c8360f', blur: '.5px', dur: '8.5s', delay: '5s' }
    ];
    var items = specs.map(function (s) {
      return '<div class="ember" style="left:' + s.left + '; bottom:0; width:' + s.size + 'px; height:' + s.size + 'px; background:radial-gradient(circle,' + s.colors + ');' +
        (s.blur ? ' filter:blur(' + s.blur + ');' : '') +
        ' animation:emberRise ' + s.dur + ' ease-in ' + s.delay + ' infinite;"></div>';
    }).join('');
    return '<div style="position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:0;">' + items + '</div>';
  }

  function renderScheduleTab() {
    var active = state.activeActor;
    var counts = {};
    SHOW.performances.forEach(function (p) {
      counts[p.jungwon] = (counts[p.jungwon] || 0) + 1;
      counts[p.yijun] = (counts[p.yijun] || 0) + 1;
    });
    var watchedByActor = {};
    SHOW.performances.forEach(function (p) {
      if (state.watched[perfId(p)]) {
        watchedByActor[p.jungwon] = (watchedByActor[p.jungwon] || 0) + 1;
        watchedByActor[p.yijun] = (watchedByActor[p.yijun] || 0) + 1;
      }
    });

    var roleCards = SHOW.roles.map(function (role) {
      var chips = role.cast.map(function (name) {
        var isActive = active === name;
        var watched = watchedByActor[name] || 0;
        var total = counts[name] || 0;
        var pinOpacity = state.pinnedActor === name ? '1' : '.32';
        if (isActive) {
          return '<button data-action="setActor" data-name="' + esc(name) + '" style="display:flex; align-items:center; gap:6px; padding:7px 9px 7px 11px; border-radius:10px; border:1px solid #ffab5e; background:linear-gradient(155deg,rgba(255,140,60,.28),rgba(200,54,20,.34)); cursor:pointer;">' +
            '<span style="font-size:12.5px; font-weight:700; color:#ffe6cf;">' + esc(name) + '</span>' +
            '<span style="font-size:10px; font-weight:700; color:#ffcaa0;">' + watched + '/' + total + '</span>' +
            '<span data-action="togglePin" data-name="' + esc(name) + '" style="font-size:11px; opacity:' + pinOpacity + ';">📌</span>' +
            '</button>';
        }
        return '<button data-action="setActor" data-name="' + esc(name) + '" style="display:flex; align-items:center; gap:6px; padding:7px 9px 7px 11px; border-radius:10px; border:1px solid rgba(255,120,60,.16); background:rgba(255,255,255,.02); cursor:pointer;">' +
          '<span style="font-size:12.5px; font-weight:600; color:rgba(240,225,210,.82);">' + esc(name) + '</span>' +
          '<span style="font-size:10px; font-weight:600; color:rgba(255,170,120,.55);">' + watched + '/' + total + '</span>' +
          '<span data-action="togglePin" data-name="' + esc(name) + '" style="font-size:11px; opacity:' + pinOpacity + ';">📌</span>' +
          '</button>';
      }).join('');
      return '<div style="background:rgba(30,15,11,.5); border:1px solid rgba(255,120,60,.12); border-radius:14px; padding:12px 12px 13px;">' +
        '<div style="display:flex; align-items:baseline; gap:8px; margin-bottom:9px;">' +
        '<span style="font-size:13.5px; font-weight:700; color:#f2e6d6;">' + esc(role.name) + '</span>' +
        '<span style="font-size:10.5px; color:rgba(255,150,90,.7); font-family:\'Nanum Myeongjo\',serif; font-style:italic;">"' + esc(role.tagline) + '"</span>' +
        '</div>' +
        '<div style="display:flex; flex-wrap:wrap; gap:7px;">' + chips + '</div>' +
        '</div>';
    }).join('');

    var clearBtn = active ?
      '<button data-action="clearFilter" style="align-self:flex-start; font-size:11px; color:rgba(255,170,120,.85); background:none; border:none; cursor:pointer; padding:0 4px;">✕ 필터 해제 · ' + esc(active) + '</button>'
      : '';

    var pinned = state.pinnedActor;
    var perfCards = SHOW.performances.map(function (p) {
      if (pinned && p.jungwon !== pinned && p.yijun !== pinned) return '';
      var id = perfId(p);
      var watched = !!state.watched[id];
      var inFilter = !active || p.jungwon === active || p.yijun === active;
      var jwHi = active === p.jungwon, yjHi = active === p.yijun;
      var seat = state.seats[id] || '';
      var cardBg = watched ? 'linear-gradient(160deg,rgba(255,120,55,.14),rgba(120,28,14,.16))' : 'rgba(28,15,11,.5)';
      var cardBorder = watched ? 'rgba(255,140,70,.5)' : 'rgba(255,120,60,.11)';
      var checkLabel = watched ? '✓ 관람' : '관람 체크';
      var checkBg = watched ? 'linear-gradient(155deg,#ff8a3d,#e5442c)' : 'rgba(255,255,255,.03)';
      var checkBorder = watched ? '#ffab5e' : 'rgba(255,120,60,.2)';
      var checkColor = watched ? '#fff' : 'rgba(240,225,210,.7)';
      var jwBg = jwHi ? 'rgba(255,120,55,.16)' : 'rgba(0,0,0,.22)';
      var jwBorder = jwHi ? 'rgba(255,150,80,.45)' : 'rgba(255,120,60,.08)';
      var jwColor = jwHi ? '#ffdcc0' : '#f0e4d4';
      var yjBg = yjHi ? 'rgba(255,120,55,.16)' : 'rgba(0,0,0,.22)';
      var yjBorder = yjHi ? 'rgba(255,150,80,.45)' : 'rgba(255,120,60,.08)';
      var yjColor = yjHi ? '#ffdcc0' : '#f0e4d4';
      var badge = p.badge ? '<span style="font-size:9px; font-weight:700; color:#2a0d06; background:linear-gradient(155deg,#ffc07a,#e5442c); padding:2px 6px; border-radius:5px; letter-spacing:.5px;">' + esc(p.badge) + '</span>' : '';

      return '<div style="border-radius:14px; padding:12px 13px; background:' + cardBg + '; border:1px solid ' + cardBorder + '; opacity:' + (inFilter ? '1' : '.34') + '; transition:opacity .2s;">' +
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">' +
        '<div style="display:flex; align-items:baseline; gap:8px;">' +
        '<span style="font-size:15px; font-weight:800; color:#f4e8d8; letter-spacing:.3px;">' + esc(p.date) + '</span>' +
        '<span style="font-size:11px; color:rgba(232,205,190,.5);">' + esc(p.dow) + '</span>' +
        '<span style="font-size:12.5px; font-weight:600; color:rgba(255,175,120,.9);">' + esc(p.time) + '</span>' +
        badge +
        '</div>' +
        '<button data-action="toggleWatch" data-id="' + esc(id) + '" style="display:flex; align-items:center; gap:5px; padding:5px 10px; border-radius:9px; cursor:pointer; border:1px solid ' + checkBorder + '; background:' + checkBg + ';">' +
        '<span style="font-size:11px; font-weight:700; color:' + checkColor + ';">' + checkLabel + '</span>' +
        '</button>' +
        '</div>' +
        '<div style="display:flex; gap:8px; margin-top:11px;">' +
        '<div style="flex:1; display:flex; align-items:center; gap:7px; padding:7px 9px; border-radius:9px; background:' + jwBg + '; border:1px solid ' + jwBorder + ';">' +
        '<span style="font-size:9.5px; color:rgba(255,175,120,.75); font-weight:600; flex:0 0 auto;">안정원</span>' +
        '<span style="font-size:12.5px; font-weight:700; color:' + jwColor + ';">' + esc(p.jungwon) + '</span>' +
        '</div>' +
        '<div style="flex:1; display:flex; align-items:center; gap:7px; padding:7px 9px; border-radius:9px; background:' + yjBg + '; border:1px solid ' + yjBorder + ';">' +
        '<span style="font-size:9.5px; color:rgba(255,175,120,.75); font-weight:600; flex:0 0 auto;">강이준</span>' +
        '<span style="font-size:12.5px; font-weight:700; color:' + yjColor + ';">' + esc(p.yijun) + '</span>' +
        '</div>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:7px; margin-top:9px;">' +
        '<span style="font-size:10px; color:rgba(232,205,190,.45); flex:0 0 auto;">내 좌석</span>' +
        '<input data-action="setSeat" data-id="' + esc(id) + '" value="' + esc(seat) + '" placeholder="예: F7" style="flex:1; min-width:0; padding:7px 10px; border-radius:9px; border:1px solid rgba(255,120,60,.18); background:rgba(0,0,0,.28); color:#f2e6d6; font-size:12px; font-weight:600; letter-spacing:.5px;" />' +
        '<button data-action="copySeat" data-id="' + esc(id) + '" title="좌석 복사" style="flex:0 0 auto; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border-radius:9px; border:1px solid rgba(255,120,60,.16); background:rgba(255,255,255,.02); cursor:pointer;">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,170,120,.85)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>' +
        '</button>' +
        '</div>' +
        '</div>';
    }).join('');

    return '<section>' +
      '<div style="display:flex; align-items:baseline; justify-content:space-between; margin:6px 4px 12px;">' +
      '<h2 style="margin:0; font-family:\'Cinzel\',serif; font-size:17px; letter-spacing:3px; color:#f0e4d4; font-weight:600;">CASTING SCHEDULE</h2>' +
      '<span style="font-size:10.5px; color:rgba(232,205,190,.42);">확정 회차</span>' +
      '</div>' +
      '<div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">' + roleCards + clearBtn + '</div>' +
      '<div style="display:flex; flex-direction:column; gap:9px;">' + perfCards + '</div>' +
      '<p style="font-size:9.5px; line-height:1.6; color:rgba(232,205,190,.35); margin:18px 4px 4px; text-align:center;">상기 스케줄은 배우 및 제작사의 사정에 따라 사전 공지 없이 변경될 수 있습니다.<br/>확정 발표된 1주차 회차만 반영되어 있습니다.</p>' +
      '</section>';
  }

  function renderSettleTab() {
    var seatCount = {};
    Object.keys(state.seats).forEach(function (id) {
      var c = normSeat(state.seats[id]);
      if (c) seatCount[c] = (seatCount[c] || 0) + 1;
    });
    var seatRows = buildSeatRows(seatCount);
    var loggedSeatCount = Object.keys(seatCount).length;

    var counts = {};
    SHOW.performances.forEach(function (p) {
      counts[p.jungwon] = (counts[p.jungwon] || 0) + 1;
      counts[p.yijun] = (counts[p.yijun] || 0) + 1;
    });
    // 배우별 정산은 스케줄 탭 관람 체크(state.watched)에서 집계
    var watchedByActorStamps = {};
    SHOW.performances.forEach(function (p) {
      if (state.watched[perfId(p)]) {
        watchedByActorStamps[p.jungwon] = (watchedByActorStamps[p.jungwon] || 0) + 1;
        watchedByActorStamps[p.yijun] = (watchedByActorStamps[p.yijun] || 0) + 1;
      }
    });
    // 상단 "누적 도장" 표시는 출동기록 도장판 합계 유지
    var totalStampCount = 0;
    state.boards.forEach(function (b) { totalStampCount += b.stamps.length; });

    // 중복 관람 횟수별 좌석 색상 (1회 → 3회 이상 순으로 진해짐)
    function tierBg(count) {
      if (count >= 3) return { grad: 'linear-gradient(155deg,#a85a26,#7a1f10)', glow: '0 0 6px 1px rgba(170,60,20,.45)' };
      if (count === 2) return { grad: 'linear-gradient(155deg,#e08a44,#b8301d)', glow: '0 0 6px 1px rgba(215,85,35,.5)' };
      return { grad: 'linear-gradient(155deg,#ffb163,#e5442c)', glow: '0 0 7px 1px rgba(255,120,45,.6)' };
    }
    function seatTile(c) {
      if (c.isSpacer) return '<div style="width:15px; height:15px; flex:0 0 auto;"></div>';
      if (c.logged) {
        var t = tierBg(c.count);
        return '<div data-action="seatTap" data-code="' + esc(c.code) + '" data-count="' + c.count + '" style="width:15px; height:15px; flex:0 0 auto; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:800; color:#2a0d06; border-radius:3px; background:' + t.grad + '; box-shadow:' + t.glow + '; cursor:pointer;">' + esc(c.num) + '</div>';
      }
      return '<div data-action="seatTap" data-code="' + esc(c.code) + '" data-count="' + c.count + '" style="width:15px; height:15px; flex:0 0 auto; display:flex; align-items:center; justify-content:center; font-size:8px; font-weight:600; color:rgba(232,205,190,.42); border-radius:3px; background:rgba(78,38,32,.5); border:1px solid rgba(150,70,55,.32); cursor:pointer;">' + esc(c.num) + '</div>';
    }

    var seatRowsHtml = seatRows.map(function (r) {
      if (r.isL) {
        return '<div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-top:11px;">' +
          '<div style="display:flex; gap:2px;">' + r.center.map(seatTile).join('') + '</div>' +
          '<span style="font-family:\'Cinzel\',serif; font-size:11px; font-weight:600; color:rgba(240,220,200,.75);">L</span>' +
          '</div>';
      }
      var entranceHtml = r.entrance ? '<div style="position:absolute; left:0; top:50%; transform:translateY(-50%); width:30px; text-align:center; font-size:7.5px; letter-spacing:.5px; color:rgba(232,205,190,.5); z-index:2;">출입구</div>' : '';
      return '<div style="position:relative; display:flex; align-items:center; gap:5px; margin-top:' + r.topGap + ';">' +
        entranceHtml +
        '<div style="display:flex; gap:2px; width:185px; justify-content:' + (r.alignRight ? 'flex-end' : 'flex-start') + '; flex:0 0 auto;">' + r.leftItems.map(seatTile).join('') + '</div>' +
        '<div style="width:16px; flex:0 0 auto; text-align:center; font-family:\'Cinzel\',serif; font-size:11px; font-weight:600; color:rgba(240,220,200,.75);">' + esc(r.letter) + '</div>' +
        '<div style="display:flex; gap:2px; flex:0 0 auto;">' + r.rightItems.map(seatTile).join('') + '</div>' +
        '</div>';
    }).join('');

    var actorGroupsHtml = SHOW.roles.map(function (r) {
      var actorsHtml = r.cast.map(function (name) {
        var watched = watchedByActorStamps[name] || 0;
        var total = counts[name] || 0;
        var pct = total ? Math.min(100, Math.round(watched / total * 100)) : 0;
        return '<div>' +
          '<div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px;">' +
          '<span style="font-weight:600; color:#f0e4d4;">' + esc(name) + '</span>' +
          '<span style="font-weight:700; color:rgba(255,170,120,.85);">' + watched + '<span style="color:rgba(232,205,190,.4); font-weight:600;">/' + total + '회</span></span>' +
          '</div>' +
          '<div style="height:6px; border-radius:4px; background:rgba(255,255,255,.05); overflow:hidden;">' +
          '<div style="height:100%; width:' + pct + '%; border-radius:4px; background:linear-gradient(90deg,#ff8a3d,#e5442c);"></div>' +
          '</div>' +
          '</div>';
      }).join('');
      return '<div style="background:rgba(30,15,11,.42); border:1px solid rgba(255,120,60,.1); border-radius:13px; padding:12px 13px;">' +
        '<div style="font-size:11.5px; font-weight:700; color:rgba(255,175,120,.85); margin-bottom:10px;">' + esc(r.name) + ' 역</div>' +
        '<div style="display:flex; flex-direction:column; gap:9px;">' + actorsHtml + '</div>' +
        '</div>';
    }).join('');

    return '<section>' +
      '<div id="settle-capture" style="padding-bottom:2px;">' +
      '<div style="display:flex; align-items:baseline; justify-content:flex-end; margin:6px 4px 16px;">' +
      '<span style="font-size:10.5px; color:rgba(232,205,190,.42);">기록된 좌석 ' + loggedSeatCount + ' · 누적 도장 ' + totalStampCount + '회</span>' +
      '</div>' +
      '<div style="background:radial-gradient(90% 60% at 20% 0%, rgba(120,30,12,.35), rgba(20,10,7,0) 60%), rgba(14,8,6,.72); border:1px solid rgba(255,120,60,.12); border-radius:16px; padding:14px 8px 16px; margin-bottom:20px;">' +
      '<div style="text-align:center; font-family:\'Cinzel\',serif; font-size:13px; letter-spacing:5px; font-weight:600; color:#f0dcc6; background:linear-gradient(90deg, rgba(120,28,12,0), rgba(150,38,18,.6), rgba(120,28,12,0)); padding:5px 0; border-radius:6px; margin:0 6px 14px;">STAGE</div>' +
      '<div style="overflow-x:auto; padding:0 4px;">' +
      '<div style="display:flex; flex-direction:column; gap:2px; min-width:min-content;">' + seatRowsHtml + '</div>' +
      '</div>' +
      '<div style="display:flex; justify-content:center; gap:11px; margin-top:15px; font-size:10px; color:rgba(232,205,190,.55);">' +
      '<span style="display:flex; align-items:center; gap:5px;"><span style="width:12px; height:12px; border-radius:3px; background:' + tierBg(1).grad + '; box-shadow:' + tierBg(1).glow + ';"></span>1회</span>' +
      '<span style="display:flex; align-items:center; gap:5px;"><span style="width:12px; height:12px; border-radius:3px; background:' + tierBg(2).grad + '; box-shadow:' + tierBg(2).glow + ';"></span>2회</span>' +
      '<span style="display:flex; align-items:center; gap:5px;"><span style="width:12px; height:12px; border-radius:3px; background:' + tierBg(3).grad + '; box-shadow:' + tierBg(3).glow + ';"></span>3회</span>' +
      '<span style="display:flex; align-items:center; gap:5px;"><span style="width:12px; height:12px; border-radius:3px; background:rgba(78,38,32,.5); border:1px solid rgba(150,70,55,.32);"></span>미기록</span>' +
      '</div>' +
      '</div>' +
      '<div>' +
      '<h3 style="margin:0 4px 10px; font-size:13px; font-weight:700; color:#f0e4d4; letter-spacing:.4px;">배우별 정산</h3>' +
      '<div style="display:flex; flex-direction:column; gap:14px;">' + actorGroupsHtml + '</div>' +
      '</div>' +
      '</div>' +
      '<div style="margin-top:20px; display:flex; gap:8px;">' +
      '<button data-action="exportData" style="flex:1; padding:12px; border-radius:11px; border:1px solid rgba(255,120,60,.2); background:rgba(255,255,255,.03); color:#f0e4d4; font-size:12px; font-weight:600; cursor:pointer;">💾 데이터 저장</button>' +
      '<button data-action="saveImage" style="flex:1; padding:12px; border-radius:11px; border:1px solid rgba(255,120,60,.2); background:rgba(255,255,255,.03); color:#f0e4d4; font-size:12px; font-weight:600; cursor:pointer;">🖼️ 이미지 저장</button>' +
      '</div>' +
      '<button data-action="resetData" style="width:100%; margin-top:8px; padding:9px; border-radius:10px; border:none; background:none; color:rgba(232,205,190,.4); font-size:10.5px; cursor:pointer;">기록 초기화</button>' +
      '</section>';
  }

  function renderBoardList() {
    var boardCardsHtml = state.boards.map(function (b, idx) {
      var count = b.stamps.length;
      var stat = boardStatus(b);
      var pct = Math.min(100, Math.round(count / STAMP_GOAL * 100));
      var boardNo = idx + 1;
      var listBadges = SHOW.tiers.map(function (t) {
        var claimed = !!b.claims[t.count];
        return '<span style="display:inline-flex; align-items:center; padding:2px 9px; border-radius:7px; font-size:10px; font-weight:800; ' +
          (claimed
            ? 'color:#fff; background:linear-gradient(155deg,#ff9d5c,#e5442c); border:1px solid #ffab5e; box-shadow:0 0 8px rgba(255,120,45,.55);'
            : 'color:rgba(255,180,130,.45); background:rgba(255,120,60,.05); border:1px solid rgba(255,120,60,.16);') +
          '">' + t.count + '회</span>';
      }).join('');
      var menuOpen = state.openMenuBoardId === b.id;
      var menuHtml = '<button data-action="toggleBoardMenu" data-id="' + b.id + '" aria-label="도장판 메뉴" style="position:absolute; top:8px; right:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:8px; border:none; background:rgba(255,255,255,.05); color:#f0e4d4; font-size:16px; line-height:1; cursor:pointer; z-index:2;">⋮</button>' +
        (menuOpen ? '<div style="position:absolute; top:40px; right:8px; z-index:3; background:#20120c; border:1px solid rgba(255,120,60,.28); border-radius:11px; overflow:hidden; box-shadow:0 8px 22px rgba(0,0,0,.55);">' +
          '<button data-action="deleteBoard" data-id="' + b.id + '" style="display:flex; align-items:center; gap:7px; padding:11px 18px 11px 14px; border:none; background:none; color:#ff9a7a; font-size:12.5px; font-weight:700; cursor:pointer; white-space:nowrap;">🗑 삭제</button>' +
          '</div>' : '');
      return '<div data-action="openBoard" data-id="' + b.id + '" style="position:relative; text-align:left; display:flex; gap:13px; padding:14px; border-radius:15px; background:rgba(24,13,9,.6); border:1px solid rgba(255,120,60,.14); cursor:pointer; width:100%;">' +
        menuHtml +
        '<img src="img/poster.jpg" alt="사칠" style="flex:0 0 auto; width:54px; height:74px; border-radius:9px; object-fit:cover; border:1px solid rgba(255,120,60,.2); background:#180d09;" />' +
        '<div style="flex:1; min-width:0;">' +
        '<div style="font-size:16px; font-weight:800; color:#f4e8d8;">' + boardNo + '</div>' +
        '<div style="font-size:10.5px; color:rgba(232,205,190,.55); margin-top:2px;">사칠 · ' + esc(SHOW.period) + '</div>' +
        '<div style="display:flex; align-items:center; gap:8px; margin-top:9px; padding-right:30px;">' +
        '<span style="font-size:14px; font-weight:800; color:#ffb877; flex:0 0 auto;">🎫 ' + count + '<span style="font-size:11px; color:rgba(232,205,190,.4);">/' + STAMP_GOAL + '</span></span>' +
        '<div style="flex:1; height:7px; border-radius:4px; background:rgba(255,255,255,.06); overflow:hidden;">' +
        '<div style="height:100%; width:' + pct + '%; border-radius:4px; background:linear-gradient(90deg,#ff8a3d,#e5442c);"></div>' +
        '</div>' +
        '</div>' +
        '<div style="display:flex; gap:5px; margin-top:9px;">' + listBadges + '</div>' +
        '</div>' +
        '</div>';
    }).join('');
    var listBody = state.boards.length
      ? '<div style="display:flex; flex-direction:column; gap:11px;">' + boardCardsHtml + '</div>'
      : '<div style="text-align:center; padding:40px 18px; border-radius:15px; border:1px dashed rgba(255,120,60,.28); background:rgba(255,255,255,.02); color:rgba(232,205,190,.55); font-size:12.5px; line-height:1.75;">아직 만든 도장판이 없어요.<br/>상단 <b style="color:#ffcaa0;">＋ 도장판 추가</b>를 눌러 첫 도장판을 만들어보세요.</div>';

    return '<div style="display:flex; align-items:center; justify-content:space-between; margin:2px 4px 14px;">' +
      '<h2 style="margin:0; font-size:19px; font-weight:800; color:#f2e6d6; letter-spacing:-.3px;">내 출동 기록 카드</h2>' +
      '<button data-action="addBoard" style="display:flex; align-items:center; gap:5px; padding:8px 12px; border-radius:10px; border:1px solid rgba(255,140,70,.4); background:linear-gradient(155deg,rgba(255,120,55,.18),rgba(200,54,20,.2)); color:#ffcaa0; font-size:11.5px; font-weight:700; cursor:pointer;">＋ 도장판 추가</button>' +
      '</div>' +
      '<div style="display:flex; gap:9px; padding:12px 13px; border-radius:13px; background:rgba(255,255,255,.03); border:1px solid rgba(255,120,60,.1); margin-bottom:16px;">' +
      '<div style="flex:0 0 auto; font-size:12px; color:rgba(255,175,120,.8);">ⓘ</div>' +
      '<p style="margin:0; font-size:10.5px; line-height:1.6; color:rgba(232,205,190,.6);">이 도장판은 실제 혜택 적립·수령 처리가 아니며, 적립 기록과 혜택 진행 상황을 직접 관리하기 위한 기능이에요.</p>' +
      '</div>' +
      listBody;
  }

  function renderBoardDetail() {
    var board = findBoard(state.currentBoardId) || state.boards[0];
    if (!board) return '';
    var boardNo = state.boards.indexOf(board) + 1;
    var count = board.stamps.length;
    var stat = boardStatus(board);
    var pct = Math.min(100, Math.round(count / STAMP_GOAL * 100));

    var slots = Math.max(STAMP_GOAL, count);
    var stampsHtml = '';
    for (var i = 0; i < slots; i++) {
      var pos = i + 1;
      var stamp = board.stamps[i];
      var gift = SHOW.tiers.some(function (t) { return t.count === pos; });
      var giftBadge = gift ? '<div style="position:absolute; top:-6px; right:-4px; z-index:2; font-size:13px;">🎁</div>' : '';
      if (stamp) {
        var stampInner = stamp.actor
          ? '<div style="width:60px; height:60px; border-radius:50%; overflow:hidden; border:2px solid #ffab5e; box-shadow:0 0 12px rgba(255,110,40,.45);"><img src="img/' + encodeURIComponent(stamp.actor) + '.jpg" alt="' + esc(stamp.actor) + '" style="width:100%; height:100%; object-fit:cover; display:block;" /></div>'
          : '<div style="width:60px; height:60px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffc98a, #e5442c 70%, #a8261a); box-shadow:0 0 12px rgba(255,110,40,.45), inset 0 0 8px rgba(120,20,8,.5); display:flex; align-items:center; justify-content:center;">' +
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3a0f06" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1.5 3-1.5 4.5 0 7.5C13.5 13.5 17 12 17 15.5A5 5 0 0 1 7 15.5c0-2 1-3 1.6-4.4C9.4 9 8 7 12 3z"/></svg>' +
            '</div>';
        stampsHtml += '<div data-action="tapStamp" data-board-id="' + board.id + '" data-idx="' + i + '" style="display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer;">' +
          '<div style="position:relative; width:60px; height:60px;">' + giftBadge + stampInner + '</div>' +
          '<span style="font-size:10px; font-weight:600; color:rgba(255,180,130,.9);">' + esc(stamp.date) + '</span>' +
          '</div>';
      } else {
        stampsHtml += '<div data-action="tapStamp" data-board-id="' + board.id + '" data-idx="' + i + '" style="display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer;">' +
          '<div style="position:relative; width:60px; height:60px;">' + giftBadge +
          '<div style="width:60px; height:60px; border-radius:50%; border:1.5px dashed rgba(255,140,80,.28); display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; color:rgba(232,205,190,.3);">' + pos + '</div>' +
          '</div>' +
          '<span style="font-size:10px; font-weight:600; color:rgba(232,205,190,.3);"></span>' +
          '</div>';
      }
    }

    var tiersHtml = SHOW.tiers.map(function (t) {
      var achieved = count >= t.count;
      var claimed = !!board.claims[t.count];
      var canClaim = achieved && !claimed;
      var remain = Math.max(0, t.count - count);
      var stateLabel = claimed ? '✓ 수령완료' : (achieved ? '🎁 수령 가능' : '🔒 ' + remain + '회 더 관람 시');
      var stateColor = claimed ? '#9fdcae' : (achieved ? '#ffb877' : 'rgba(232,205,190,.42)');
      var bg = (achieved || claimed) ? 'linear-gradient(160deg,rgba(255,120,55,.14),rgba(120,28,14,.14))' : 'rgba(28,15,11,.45)';
      var border = (achieved || claimed) ? 'rgba(255,140,70,.5)' : 'rgba(255,120,60,.1)';
      var nameColor = (achieved || claimed) ? '#ffe6d2' : 'rgba(240,225,210,.62)';
      var badgeColor = (achieved || claimed) ? '#fff' : 'rgba(255,180,130,.6)';
      var badgeBg = (achieved || claimed) ? 'linear-gradient(155deg,#ff7a3d,#c8360f)' : 'rgba(255,120,60,.08)';
      var badgeBorder = (achieved || claimed) ? '#ffab5e' : 'rgba(255,120,60,.25)';
      var actionHtml = canClaim
        ? '<button data-action="claimTier" data-board-id="' + board.id + '" data-count="' + t.count + '" style="flex:0 0 auto; padding:9px 15px; border-radius:10px; border:none; background:linear-gradient(155deg,#ff7a3d,#e5442c); color:#fff; font-size:12px; font-weight:700; cursor:pointer; box-shadow:0 3px 10px rgba(200,54,20,.4);">수령하기</button>'
        : (claimed
          ? '<div style="flex:0 0 auto; display:flex; align-items:center; gap:4px; padding:9px 13px; border-radius:10px; background:rgba(120,200,140,.14); border:1px solid rgba(120,200,140,.4); color:#9fdcae; font-size:12px; font-weight:700;">✓ 수령완료</div>'
          : '<div style="flex:0 0 auto; font-size:14px; opacity:.5;">🔒</div>');
      return '<div style="display:flex; align-items:center; gap:13px; padding:14px 14px; border-radius:14px; background:' + bg + '; border:1px solid ' + border + ';">' +
        '<div style="flex:0 0 auto; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:' + badgeColor + '; background:' + badgeBg + '; border:1.5px solid ' + badgeBorder + ';">' + t.count + '회</div>' +
        '<div style="flex:1; min-width:0;">' +
        '<div style="font-size:13.5px; font-weight:700; color:' + nameColor + ';">' + esc(t.name) + '</div>' +
        '<div style="font-size:10.5px; margin-top:3px; font-weight:600; color:' + stateColor + ';">' + stateLabel + '</div>' +
        '</div>' +
        actionHtml +
        '</div>';
    }).join('');

    var tierBadges = SHOW.tiers.map(function (t) {
      var claimed = !!board.claims[t.count];
      return '<span style="display:inline-flex; align-items:center; padding:3px 10px; border-radius:8px; font-size:11px; font-weight:800; ' +
        (claimed
          ? 'color:#fff; background:linear-gradient(155deg,#ff9d5c,#e5442c); border:1px solid #ffab5e; box-shadow:0 0 9px rgba(255,120,45,.6);'
          : 'color:rgba(255,180,130,.45); background:rgba(255,120,60,.05); border:1px solid rgba(255,120,60,.16);') +
        '">' + t.count + '회</span>';
    }).join('');

    return '<div style="display:flex; align-items:center; gap:10px; margin:2px 0 16px;">' +
      '<button data-action="closeBoard" style="flex:0 0 auto; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border-radius:10px; border:1px solid rgba(255,120,60,.16); background:rgba(255,255,255,.02); color:#f0e4d4; cursor:pointer;">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>' +
      '</button>' +
      '<div>' +
      '<div style="font-size:16px; font-weight:800; color:#f2e6d6;">출동 기록 카드 ' + boardNo + '</div>' +
      '<div style="font-size:10px; color:rgba(232,205,190,.5);">도장을 눌러 관람 회차를 기록하세요</div>' +
      '</div>' +
      '</div>' +
      '<div style="background:radial-gradient(120% 90% at 15% 0%, rgba(180,45,20,.4), rgba(20,10,7,0) 62%), rgba(18,10,7,.75); border:1px solid rgba(255,120,60,.16); border-radius:16px; padding:16px 16px 18px;">' +
      '<div style="display:flex; align-items:center; justify-content:space-between;">' +
      '<div>' +
      '<div style="font-family:\'Nanum Myeongjo\',serif; font-size:19px; font-weight:800; color:#ecdfce;">사칠</div>' +
      '<div style="font-size:10px; color:rgba(232,205,190,.5); margin-top:2px;">' + esc(SHOW.period) + '</div>' +
      '</div>' +
      '<div style="text-align:right;">' +
      '<div style="font-size:22px; font-weight:800; color:#ffb877; line-height:1;">🎫 ' + count + '<span style="color:rgba(232,205,190,.4); font-size:15px;">/' + STAMP_GOAL + '</span></div>' +
      '<div style="display:flex; gap:5px; justify-content:flex-end; margin-top:7px;">' + tierBadges + '</div>' +
      '</div>' +
      '</div>' +
      '<div style="height:9px; border-radius:5px; background:rgba(255,255,255,.06); overflow:hidden; margin-top:14px;">' +
      '<div style="height:100%; width:' + pct + '%; border-radius:5px; background:linear-gradient(90deg,#ff8a3d,#e5442c); box-shadow:0 0 10px rgba(255,110,40,.5);"></div>' +
      '</div>' +
      '</div>' +
      '<div style="margin-top:20px;">' +
      '<div style="display:flex; align-items:center; justify-content:space-between; margin:0 4px 12px;">' +
      '<h3 style="margin:0; font-size:14px; font-weight:800; color:#f0e4d4;">적립</h3>' +
      '<button data-action="saveStampImage" style="display:flex; align-items:center; gap:5px; padding:7px 11px; border-radius:9px; border:1px solid rgba(255,140,70,.35); background:linear-gradient(155deg,rgba(255,120,55,.16),rgba(200,54,20,.18)); color:#ffcaa0; font-size:10.5px; font-weight:700; cursor:pointer;">🖼️ 이미지로 저장</button>' +
      '</div>' +
      '<div id="stamp-capture" style="padding:16px 14px 6px; border-radius:14px; background:radial-gradient(120% 80% at 20% 0%, rgba(180,45,20,.18), rgba(20,10,7,0) 60%), rgba(14,8,6,.5);">' +
      '<div style="display:flex; align-items:baseline; justify-content:space-between; margin:0 2px 15px;">' +
      '<span style="font-family:\'Nanum Myeongjo\',serif; font-size:14px; font-weight:800; color:#ecdfce;">사칠 관람 적립</span>' +
      '<span style="font-size:12px; font-weight:800; color:#ffb877;">🎫 ' + count + '<span style="color:rgba(232,205,190,.4); font-size:10px;">/' + STAMP_GOAL + '</span></span>' +
      '</div>' +
      '<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:14px 8px;">' + stampsHtml + '</div>' +
      '</div>' +
      '</div>' +
      '<div style="margin-top:24px;">' +
      '<h3 style="margin:0 4px 12px; font-size:14px; font-weight:800; color:#f0e4d4;">혜택</h3>' +
      '<div style="display:flex; flex-direction:column; gap:10px;">' + tiersHtml + '</div>' +
      '</div>' +
      '<p style="font-size:9.5px; line-height:1.65; color:rgba(232,205,190,.38); margin:20px 6px 4px; text-align:center;">본 기록은 개인 관람 이력을 정리하기 위한 참고용이며,<br/>실제 MD 부스 적립·혜택 수령을 대신하지 않습니다.</p>';
  }

  function renderCardTab() {
    return '<section>' + (state.boardView === 'list' ? renderBoardList() : renderBoardDetail()) + '</section>';
  }

  function renderNav() {
    function navColor(t) { return state.tab === t ? '#ff9d5c' : 'rgba(232,205,190,.4)'; }
    return '<nav style="position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:432px; z-index:5; display:flex; background:rgba(14,8,6,.92); backdrop-filter:blur(14px); border-top:1px solid rgba(255,120,60,.14);">' +
      '<button data-action="setTab" data-tab="schedule" style="flex:1; padding:11px 0 15px; background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; color:' + navColor('schedule') + ';">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>' +
      '<span style="font-size:9.5px; font-weight:700;">스케줄</span>' +
      '</button>' +
      '<button data-action="setTab" data-tab="settle" style="flex:1; padding:11px 0 15px; background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; color:' + navColor('settle') + ';">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h16M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3M5 11l-1 8M19 11l1 8M8 19h8"/></svg>' +
      '<span style="font-size:9.5px; font-weight:700;">정산</span>' +
      '</button>' +
      '<button data-action="setTab" data-tab="card" style="flex:1; padding:11px 0 15px; background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; color:' + navColor('card') + ';">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.4"/><path d="M14 10h4M14 14h4"/></svg>' +
      '<span style="font-size:9.5px; font-weight:700;">출동기록</span>' +
      '</button>' +
      '</nav>';
  }

  function renderModal() {
    if (!state.modalOpen) return '';
    return '<div data-action="closeModalBackdrop" style="position:fixed; inset:0; z-index:30; display:flex; align-items:flex-end; justify-content:center; background:rgba(6,3,2,.62); backdrop-filter:blur(3px);">' +
      '<div data-action="stopProp" style="width:100%; max-width:432px; background:linear-gradient(180deg,#1a0e09,#120a07); border:1px solid rgba(255,120,60,.2); border-radius:20px 20px 0 0; padding:18px 18px 24px; box-shadow:0 -8px 30px rgba(0,0,0,.55);">' +
      '<div style="width:40px; height:4px; border-radius:2px; background:rgba(255,150,90,.3); margin:0 auto 16px;"></div>' +
      '<h3 style="margin:0 0 4px; font-size:16px; font-weight:800; color:#f2e6d6;">' + (state.mfEditIdx != null ? '도장 수정' : '회차 정보 입력') + '</h3>' +
      '<p style="margin:0 0 16px; font-size:11px; color:rgba(232,205,190,.5);">' + (state.mfEditIdx != null ? '관람일과 도장 이미지를 수정할 수 있어요.' : '관람한 회차 정보를 입력하면 도장이 적립돼요.') + '</p>' +
      '<div style="display:flex; flex-direction:column; gap:11px;">' +
      '<div>' +
      '<label style="display:block; font-size:10.5px; color:rgba(255,175,120,.75); font-weight:600; margin-bottom:5px;">관람일</label>' +
      '<input id="mf-date" data-action="mfDate" value="' + esc(state.mfDate) + '" placeholder="예: 08.09" style="width:100%; padding:11px 12px; border-radius:10px; border:1px solid rgba(255,120,60,.2); background:rgba(0,0,0,.3); color:#f2e6d6; font-size:13px; font-weight:600;" />' +
      '</div>' +
      '<div>' +
      '<label style="display:block; font-size:10.5px; color:rgba(255,175,120,.75); font-weight:600; margin-bottom:8px;">적립 도장 이미지 선택</label>' +
      SHOW.roles.map(function (r) {
        return '<div style="font-size:10px; color:rgba(232,205,190,.5); font-weight:600; margin:2px 2px 6px;">' + esc(r.name) + '</div>' +
          '<div style="display:flex; gap:8px; margin-bottom:10px;">' +
          r.cast.map(function (name) {
            var sel = state.mfActor === name;
            return '<button data-action="selectStampActor" data-name="' + esc(name) + '" style="flex:1; min-width:0; display:flex; flex-direction:column; align-items:center; gap:5px; padding:8px 4px; border-radius:12px; background:' + (sel ? 'linear-gradient(155deg,rgba(255,140,60,.22),rgba(200,54,20,.26))' : 'rgba(255,255,255,.02)') + '; border:' + (sel ? '1.5px solid #ffab5e' : '1px solid rgba(255,120,60,.16)') + '; cursor:pointer;">' +
              '<img src="img/' + encodeURIComponent(name) + '.jpg" alt="' + esc(name) + '" style="width:46px; height:46px; border-radius:50%; object-fit:cover; ' + (sel ? '' : 'opacity:.82;') + '" />' +
              '<span style="font-size:11px; font-weight:700; color:' + (sel ? '#ffdcc0' : 'rgba(240,225,210,.7)') + ';">' + esc(name) + '</span>' +
              '</button>';
          }).join('') +
          '</div>';
      }).join('') +
      '</div>' +
      '</div>' +
      '<div style="display:flex; gap:9px; margin-top:18px;">' +
      (state.mfEditIdx != null
        ? '<button data-action="deleteStamp" style="flex:1; padding:13px; border-radius:11px; border:1px solid rgba(230,80,60,.45); background:rgba(200,50,30,.14); color:#ff9a7a; font-size:13px; font-weight:700; cursor:pointer;">삭제</button>'
        : '<button data-action="closeModal" style="flex:1; padding:13px; border-radius:11px; border:1px solid rgba(255,120,60,.2); background:rgba(255,255,255,.03); color:rgba(240,225,210,.8); font-size:13px; font-weight:700; cursor:pointer;">취소</button>') +
      '<button data-action="submitStamp" style="flex:2; padding:13px; border-radius:11px; border:none; background:linear-gradient(155deg,#ff7a3d,#e5442c); color:#fff; font-size:13px; font-weight:800; cursor:pointer; box-shadow:0 3px 12px rgba(200,54,20,.4);">' + (state.mfEditIdx != null ? '수정 완료' : '도장 적립') + '</button>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  function renderToast() {
    if (!state.toast) return '';
    return '<div style="position:fixed; bottom:92px; left:50%; transform:translateX(-50%); z-index:20; padding:10px 18px; border-radius:12px; background:rgba(30,14,9,.95); border:1px solid rgba(255,140,70,.3); color:#ffd9b8; font-size:12px; font-weight:600; box-shadow:0 6px 20px rgba(0,0,0,.5); animation:toastIn .22s ease; white-space:nowrap;">' + esc(state.toast) + '</div>';
  }

  function render() {
    var tabHtml = state.tab === 'schedule' ? renderScheduleTab() : (state.tab === 'settle' ? renderSettleTab() : renderCardTab());

    var html = '<div class="page-bg">' +
      '<div class="shell">' +
      renderEmbers() +
      renderHeader() +
      '<main style="position:relative; z-index:1; padding:0 16px;">' + tabHtml + '</main>' +
      renderNav() +
      renderModal() +
      renderToast() +
      '</div>' +
      '</div>';

    document.getElementById('app').innerHTML = html;
  }

  // ---------- EVENT DELEGATION ----------

  function closestAction(el) {
    while (el && el !== document.body) {
      if (el.getAttribute && el.getAttribute('data-action')) return el;
      el = el.parentNode;
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var target = closestAction(e.target);
    var action = target ? target.getAttribute('data-action') : null;
    // 도장판 ⋮ 메뉴가 열려 있고, 메뉴 관련 클릭이 아니면 닫는다
    if (state.openMenuBoardId != null && action !== 'toggleBoardMenu' && action !== 'deleteBoard') {
      state.openMenuBoardId = null;
      if (!target) { render(); return; }
    }
    if (!target) return;
    switch (action) {
      case 'setTab': setTab(target.getAttribute('data-tab')); break;
      case 'setActor': setActor(target.getAttribute('data-name')); break;
      case 'togglePin': e.stopPropagation(); togglePin(target.getAttribute('data-name')); break;
      case 'clearFilter': clearFilter(); break;
      case 'toggleWatch': toggleWatch(target.getAttribute('data-id')); break;
      case 'copySeat': {
        var id = target.getAttribute('data-id');
        if (state.seats[id]) copySeat(state.seats[id]);
        break;
      }
      case 'seatTap': seatTap(target.getAttribute('data-code'), parseInt(target.getAttribute('data-count'), 10) || 0); break;
      case 'exportData': exportData(); break;
      case 'saveImage': saveImage(); break;
      case 'saveStampImage': saveStampImage(); break;
      case 'triggerImport': triggerImport(); break;
      case 'resetData': resetData(); break;
      case 'addBoard': addBoard(); break;
      case 'openBoard': openBoard(parseInt(target.getAttribute('data-id'), 10)); break;
      case 'toggleBoardMenu': e.stopPropagation(); toggleBoardMenu(parseInt(target.getAttribute('data-id'), 10)); break;
      case 'deleteBoard': e.stopPropagation(); deleteBoard(parseInt(target.getAttribute('data-id'), 10)); break;
      case 'closeBoard': closeBoard(); break;
      case 'tapStamp': {
        var boardId = parseInt(target.getAttribute('data-board-id'), 10);
        var idx = parseInt(target.getAttribute('data-idx'), 10);
        var board = findBoard(boardId);
        var stamp = board ? board.stamps[idx] : null;
        tapStamp(boardId, idx, stamp || null);
        break;
      }
      case 'claimTier': claimTier(parseInt(target.getAttribute('data-board-id'), 10), parseInt(target.getAttribute('data-count'), 10)); break;
      case 'selectStampActor': selectStampActor(target.getAttribute('data-name')); break;
      case 'closeModal': closeModal(); break;
      case 'closeModalBackdrop': closeModal(); break;
      case 'stopProp': e.stopPropagation(); break;
      case 'submitStamp': submitStamp(); break;
      case 'deleteStamp': deleteStamp(); break;
    }
  });

  document.addEventListener('input', function (e) {
    var action = e.target.getAttribute && e.target.getAttribute('data-action');
    if (!action) return;
    switch (action) {
      case 'mfDate': state.mfDate = e.target.value; break;
      default: return;
    }
  });

  document.addEventListener('change', function (e) {
    var action = e.target.getAttribute && e.target.getAttribute('data-action');
    if (action === 'setSeat') {
      setSeat(e.target.getAttribute('data-id'), e.target.value);
    }
  });

  document.getElementById('sachil-import').addEventListener('change', importData);

  render();
})();
