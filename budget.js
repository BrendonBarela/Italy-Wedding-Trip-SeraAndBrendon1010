(() => {
  "use strict";
  const STORAGE_KEY="sb-private-budget-v2";
  let state=null, saveTimer=null;
  const $=s=>document.querySelector(s);
  const clone=v=>JSON.parse(JSON.stringify(v));
  const numberValue=v=>{ if(v===""||v==null) return null; const n=Number(v); return Number.isFinite(n)?Math.max(0,n):null; };
  const money=(n,c)=>new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:2}).format(n||0);
  const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));

  const defaults=data=>({version:2,items:clone(data?.budget?.items||[])});
  const totals=()=>state.items.reduce((a,i)=>{ const n=numberValue(i.amount); if(n!==null) a[i.currency]=(a[i.currency]||0)+n; return a; },{USD:0,EUR:0});

  const renderTotals=()=>{
    const t=totals();
    $("#spending-total").innerHTML=`<div><span>USD spent</span><strong>${money(t.USD,"USD")}</strong></div><div><span>EUR spent</span><strong>${money(t.EUR,"EUR")}</strong></div>`;
  };
  const row=i=>`<article class="spending-row" data-id="${esc(i.id)}">
    <input class="spending-name" data-field="item" value="${esc(i.item)}" aria-label="Expense description">
    <button class="spending-delete" type="button" aria-label="Remove item">×</button>
    <div class="spending-amount"><select data-field="currency"><option value="USD"${i.currency==="USD"?" selected":""}>USD</option><option value="EUR"${i.currency==="EUR"?" selected":""}>EUR</option></select><input type="number" min="0" step="0.01" inputmode="decimal" data-field="amount" value="${i.amount??""}" aria-label="Amount"></div>
    <input class="spending-note" data-field="note" value="${esc(i.note||"")}" placeholder="Optional note">
  </article>`;
  const render=()=>{ $("#spending-list").innerHTML=state.items.map(row).join(""); renderTotals(); };

  const save=async()=>{
    try{
      await window.SBPrivateTrip.encryptLocal(STORAGE_KEY,state);
      const el=$("#budget-save-status"); if(el){el.textContent="Saved encrypted on this device ✓"; setTimeout(()=>{if(el)el.textContent="";},1500);}
    }catch{}
  };
  const queueSave=()=>{clearTimeout(saveTimer);saveTimer=setTimeout(save,250);};

  const showLocked=()=>{
    $("#budget-locked")?.removeAttribute("hidden"); $("#budget-app")?.setAttribute("hidden","");
    const b=$("#budget-unlock");
    if(window.SBPrivateTrip?.isStandalone){b.hidden=false;b.onclick=()=>window.SBPrivateTrip.unlock();}
    else {b.hidden=true; const n=$("#budget-lock-note"); if(n)n.textContent="The spending record is available only inside the installed app after unlocking Private Trip Mode.";}
  };
  const showUnlocked=async data=>{
    $("#budget-locked")?.setAttribute("hidden",""); $("#budget-app")?.removeAttribute("hidden");
    if(!state){try{state=await window.SBPrivateTrip.decryptLocal(STORAGE_KEY);}catch{} if(!state)state=defaults(data);}
    render();
  };

  document.addEventListener("input",e=>{
    const c=e.target.closest("[data-field]"); if(!c||!state)return;
    const r=c.closest(".spending-row"); if(!r)return;
    const i=state.items.find(x=>x.id===r.dataset.id); if(!i)return;
    i[c.dataset.field]=c.dataset.field==="amount"?numberValue(c.value):c.value; renderTotals(); queueSave();
  });
  document.addEventListener("change",e=>{
    if(e.target.matches("[data-field]")) e.target.dispatchEvent(new Event("input",{bubbles:true}));
  });
  document.addEventListener("click",e=>{
    if(e.target.id==="add-spending-item"){
      const id="expense-"+Date.now().toString(36); state.items.push({id,item:"New expense",currency:"EUR",amount:null,note:""}); render(); queueSave();
      document.querySelector(`[data-id="${id}"] .spending-name`)?.focus();
    }
    const del=e.target.closest(".spending-delete"); if(del&&state){const r=del.closest(".spending-row");state.items=state.items.filter(x=>x.id!==r.dataset.id);render();queueSave();}
  });

  document.addEventListener("sb:private-unlocked",e=>{showUnlocked(e.detail).catch(()=>{});});
  document.addEventListener("DOMContentLoaded",()=>{const d=window.SBPrivateTrip?.getData?.(); if(window.SBPrivateTrip?.isStandalone&&d)showUnlocked(d); else showLocked();});
})();