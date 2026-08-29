module.exports=[51092,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(71133),e=a.i(38246),f=a.i(59835),g=a.i(39410),h=a.i(94582),i=a.i(78560),j=a.i(90195),k=a.i(69424),l=a.i(75160);let m=(0,a.i(64831).default)("image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);var n=a.i(38835),o=a.i(33540),p=a.i(43419),q=a.i(26634),r=a.i(19783),s=a.i(36273),t=a.i(8311),u=a.i(71985),v=a.i(63145);function w(a){return a.content||a.post_text||a.caption||""}function x(a){return a.likes_count??a.likes??0}function y(a){if(a.media_type?.includes("video"))return!0;let b=(a.media_url||"").toLowerCase();return b.includes(".mp4")||b.includes(".mov")||b.includes(".webm")||b.includes("video")}function z({post:a,liked:c,onLike:f,onShare:g,copied:h,ago:i,t:l}){let m=w(a),n=x(a),o=(a.shop_name||"TX").split(" ").map(a=>a[0]).join("").substring(0,2).toUpperCase(),p=y(a),q=Date.now()-new Date(a.created_at).getTime()<216e5;return(0,b.jsxs)("article",{className:"vybe-card",children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"0.7rem",padding:"0.9rem 1rem 0"},children:[(0,b.jsx)("div",{style:{width:42,height:42,borderRadius:12,flexShrink:0,overflow:"hidden",background:"var(--sn-bg)",border:"1.5px solid rgba(29,78,216,0.2)",display:"flex",alignItems:"center",justifyContent:"center"},children:a.shop_logo?(0,b.jsx)(d.default,{src:a.shop_logo,alt:o,width:42,height:42,style:{objectFit:"cover",width:"100%",height:"100%"}}):(0,b.jsx)("span",{style:{fontSize:13,fontWeight:800,color:"var(--sn-text)",letterSpacing:"-0.02em"},children:o})}),(0,b.jsxs)("div",{style:{flex:1,minWidth:0},children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"},children:[(0,b.jsx)("span",{style:{fontSize:14,fontWeight:700,color:"var(--sn-text)",letterSpacing:"-0.01em"},children:a.shop_name||l("vybe.seller")}),!1!==a.is_verified&&(0,b.jsxs)("span",{style:{display:"inline-flex",alignItems:"center",gap:2,background:"rgba(5,150,105,0.12)",border:"1px solid rgba(5,150,105,0.2)",color:"#10B981",fontSize:"0.58rem",fontWeight:700,padding:"1px 6px",borderRadius:999,letterSpacing:"0.04em"},children:[(0,b.jsx)(s.ShieldCheck,{size:8})," ",l("vybe.verified")]}),q&&(0,b.jsx)("span",{style:{background:"rgba(29,78,216,0.15)",color:"var(--sn-text)",fontSize:"0.55rem",fontWeight:800,padding:"1px 6px",borderRadius:999,letterSpacing:"0.06em",border:"1px solid rgba(29,78,216,0.2)"},children:l("vybe.newPost")})]}),(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:2},children:[(0,b.jsx)(t.Clock,{size:9,color:"#9CA3AF"}),(0,b.jsx)("span",{style:{fontSize:11,color:"var(--sn-subtle)"},children:i(a.created_at)}),a.category&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("span",{style:{color:"var(--sn-border-strong)"},children:"·"}),(0,b.jsx)("span",{style:{fontSize:11,color:"var(--sn-subtle)"},children:a.category})]})]})]}),a.tag&&(0,b.jsxs)("span",{style:{fontSize:10,fontWeight:700,color:"var(--sn-text)",background:"rgba(29,78,216,0.10)",padding:"3px 9px",borderRadius:999,flexShrink:0,border:"1px solid rgba(29,78,216,0.15)",letterSpacing:"0.02em"},children:["#",a.tag]})]}),m&&(0,b.jsx)("div",{style:{padding:"0.65rem 1rem 0"},children:(0,b.jsx)("p",{style:{fontSize:14,color:"var(--sn-muted)",lineHeight:1.65,margin:0,letterSpacing:"-0.005em"},children:m})}),a.price&&a.price>0&&(0,b.jsx)("div",{style:{padding:"0.5rem 1rem 0"},children:(0,b.jsx)("span",{className:"price-badge",children:"TZS "+Number(a.price).toLocaleString("en-US")})}),a.media_url&&(0,b.jsx)("div",{style:{marginTop:"0.75rem",position:"relative",background:"var(--sn-page)",borderRadius:12,overflow:"hidden"},children:p?(0,b.jsx)("video",{src:a.media_url,controls:!0,playsInline:!0,muted:!0,style:{width:"100%",maxHeight:520,display:"block",borderRadius:12}}):(0,b.jsx)(d.default,{src:a.media_url,alt:m||l("vybe.noImage"),width:680,height:680,style:{width:"100%",height:"auto",maxHeight:520,objectFit:"contain",display:"block",borderRadius:12}})}),(0,b.jsxs)("div",{className:"vybe-actions",style:{display:"flex",alignItems:"center",gap:10,padding:"0.75rem 1rem 0.9rem",marginTop:"0.6rem",borderTop:"1px solid var(--sn-border)"},children:[(0,b.jsxs)("button",{className:`like-btn ${c?"liked":""}`,onClick:f,"aria-label":l(c?"vybe.liked":"vybe.like"),children:[(0,b.jsx)(j.Heart,{size:14,style:{fill:c?"#EF4444":"none",transition:"fill .15s"}}),(0,b.jsx)("span",{children:n>0?n:l("vybe.like")})]}),(0,b.jsxs)("button",{className:"like-btn",onClick:g,"aria-label":l("vybe.sharePost"),children:[(0,b.jsx)(u.Share2,{size:13}),(0,b.jsx)("span",{children:l(h?"vybe.linkCopied":"vybe.sharePost")})]}),(0,b.jsx)("div",{style:{flex:1}}),a.product_id&&a.store_id&&(0,b.jsxs)(e.default,{href:`/store/${a.store_id}?product=${a.product_id}`,className:"visit-btn","aria-label":l("vybe.viewProduct"),children:[(0,b.jsx)(v.ShoppingBag,{size:12}),l("vybe.viewProduct")]}),a.store_id&&(0,b.jsxs)(e.default,{href:`/store/${a.store_id}`,className:"visit-btn","aria-label":`${l("vybe.visitShop")}: ${a.shop_name}`,children:[(0,b.jsx)(k.Store,{size:12}),l("vybe.visitShop")]})]})]})}a.s(["default",0,function(){let{t:a}=(0,f.useTranslation)(),[d,e]=(0,c.useState)([]),[j,k]=(0,c.useState)("all"),[s,t]=(0,c.useState)(""),[u,v]=(0,c.useState)(!0),[A,B]=(0,c.useState)(null),[C,D]=(0,c.useState)(new Set),[E,F]=(0,c.useState)(12),G=(0,c.useCallback)(b=>{let c=Math.floor((Date.now()-new Date(b).getTime())/6e4);if(c<1)return a("vybe.justNow");if(c<60)return a("vybe.minAgo",{n:String(c)});let d=Math.floor(c/60);return d<24?a("vybe.hrAgo",{n:String(d)}):new Date(b).toLocaleDateString("en-GB",{day:"numeric",month:"short"})},[a]),H=(0,c.useCallback)(async()=>{v(!0),B(null);try{let{data:a,error:b}=await i.sb.from("feed_posts").select("*").order("created_at",{ascending:!1}).limit(100);if(b)throw b;e(a||[])}catch{B(a("vybe.couldNotLoad"))}finally{v(!1)}},[a]);(0,c.useEffect)(()=>{H()},[]);let I=async a=>{let b=C.has(a.id),c=x(a)+(b?-1:1);D(c=>{let d=new Set(c);return b?d.delete(a.id):d.add(a.id),d}),e(b=>b.map(b=>b.id===a.id?{...b,likes:c,likes_count:c}:b)),await i.sb.from("feed_posts").update({likes:c,likes_count:c}).eq("id",a.id)},[J,K]=(0,c.useState)(null),L=async a=>{let b=w(a)||a.shop_name||"ShopNekt";if("u">typeof navigator&&navigator.share)try{await navigator.share({title:a.shop_name||"ShopNekt",text:b,url:""});return}catch{}try{await navigator.clipboard.writeText(""),K(a.id),setTimeout(()=>K(null),2e3)}catch{}},M=(0,c.useMemo)(()=>{let a=d;if("photo"===j&&(a=a.filter(a=>a.media_url&&!y(a))),"video"===j&&(a=a.filter(a=>a.media_url&&y(a))),s.trim()){let b=s.toLowerCase();a=a.filter(a=>(a.shop_name||"").toLowerCase().includes(b)||w(a).toLowerCase().includes(b)||(a.tag||"").toLowerCase().includes(b)||(a.category||"").toLowerCase().includes(b))}return a},[d,j,s]);return d.reduce((a,b)=>a+x(b),0),[...new Set(d.map(a=>a.category).filter(Boolean))],(0,b.jsxs)("main",{style:{minHeight:"100vh",background:"var(--sn-page)",paddingTop:68,fontFamily:"var(--sn-font)"},children:[(0,b.jsx)("style",{children:`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse   { 0%,100% { opacity:.5 } 50% { opacity:1 } }

        .vybe-card {
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          overflow: hidden;
          transition: border-color .22s, box-shadow .22s, transform .22s;
        }
        .vybe-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }

        .like-btn {
          display:inline-flex; align-items:center; gap:5px;
          background: #F3F4F6;
          border: 1px solid #E5E7EB;
          border-radius: 999px;
          color: #6B7280;
          cursor:pointer; font-size:13px; font-weight:600;
          padding: 7px 14px;
          transition: all .18s;
          font-family: var(--sn-font);
        }
        .like-btn:hover { background:rgba(239,68,68,.12); border-color:rgba(239,68,68,.3); color:#EF4444; }
        .like-btn.liked { background:rgba(239,68,68,.15); border-color:rgba(239,68,68,.4); color:#EF4444; }

        .visit-btn {
          display:inline-flex; align-items:center; gap:6px;
          background: linear-gradient(135deg, #EFF6FF, #1B3A8A);
          border: 1px solid rgba(29,78,216,.30);
          color: #1D4ED8;
          border-radius: 999px;
          padding: 7px 18px;
          font-size:13px; font-weight:700;
          text-decoration:none;
          transition: all .18s;
        }
        .visit-btn:hover {
          background: #1D4ED8;
          color: #0F172A;
          border-color: #1D4ED8;
          box-shadow: 0 4px 16px rgba(29,78,216,.35);
        }

        .filter-pill {
          display:inline-flex; align-items:center; gap:5px;
          padding: 7px 18px; border-radius:999px;
          font-size:13px; font-weight:600; cursor:pointer;
          border: 1.5px solid #E5E7EB;
          background: transparent;
          color: #9CA3AF;
          transition: all .18s;
          font-family: var(--sn-font);
          white-space: nowrap;
        }
        .filter-pill:hover  { border-color:#D1D5DB; color:#374151; }
        .filter-pill.active { background:#1D4ED8; border-color:#1D4ED8; color:#0F172A; }

        .cat-chip {
          display:inline-flex; align-items:center; gap:4px;
          padding:5px 14px; border-radius:999px;
          font-size:12px; font-weight:600; cursor:pointer;
          border:1px solid #E5E7EB;
          background:#F9FAFB;
          color:#6B7280;
          text-decoration:none;
          transition:all .15s;
          white-space:nowrap;
        }
        .cat-chip:hover { border-color:rgba(29,78,216,.4); color:#1D4ED8; background:rgba(29,78,216,.08); }

        .search-input {
          width:100%; padding:11px 16px 11px 42px;
          background:#F3F4F6;
          border:1.5px solid #E5E7EB;
          border-radius:14px; font-size:14px;
          color:#fff; outline:none;
          font-family: var(--sn-font);
          transition:all .2s; box-sizing:border-box;
        }
        .search-input::placeholder { color:#9CA3AF; }
        .search-input:focus { border-color:rgba(29,78,216,.45); background:#E5E7EB; }

        .live-dot { width:7px; height:7px; border-radius:50%; background:#22C55E; animation:pulse 1.8s ease-in-out infinite; }
        .price-badge { background:rgba(29,78,216,.12); color:#1D4ED8; padding:3px 11px; border-radius:999px; font-size:12px; font-weight:800; border:1px solid rgba(29,78,216,.2); }

        @media (max-width:480px) {
          .vybe-actions { flex-wrap:wrap; gap:8px !important; }
          .visit-btn, .like-btn { flex:1; justify-content:center; }
        }
      
        .filter-pill { display:inline-flex; align-items:center; gap:5px; padding:6px 14px; border-radius:999px; font-size:0.73rem; font-weight:700; cursor:pointer; border:1.5px solid var(--sn-border); background:var(--sn-bg); color:var(--sn-muted); transition:all 0.18s; font-family:var(--sn-font); }
        .filter-pill.active { background:var(--sn-primary); color:var(--sn-primary-fg); border-color:var(--sn-primary); }
        .filter-pill:hover:not(.active) { border-color:var(--sn-border-strong); background:var(--sn-page); }
      `}),(0,b.jsx)(g.SiteNav,{}),(0,b.jsx)("div",{style:{background:"var(--sn-bg)",borderBottom:"1px solid var(--sn-border)",position:"sticky",top:60,zIndex:90},children:(0,b.jsxs)("div",{style:{maxWidth:680,margin:"0 auto",padding:"0.75rem 4%"},children:[(0,b.jsxs)("div",{style:{position:"relative",marginBottom:"0.6rem"},children:[(0,b.jsx)(o.Search,{size:15,style:{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--sn-subtle)"}}),(0,b.jsx)("input",{className:"search-input",value:s,onChange:a=>t(a.target.value),placeholder:a("vybe.searchPlaceholder"),style:{width:"100%",boxSizing:"border-box",paddingLeft:36,paddingRight:16,paddingTop:9,paddingBottom:9,border:"1.5px solid var(--sn-border)",borderRadius:12,fontSize:"0.85rem",background:"var(--sn-page)",color:"var(--sn-text)",outline:"none",fontFamily:"var(--sn-font)"}})]}),(0,b.jsxs)("div",{style:{display:"flex",gap:6},children:[(0,b.jsxs)("button",{className:`filter-pill ${"all"===j?"active":""}`,onClick:()=>k("all"),children:[(0,b.jsx)(p.TrendingUp,{size:12})," ",a("vybe.allPosts")]}),(0,b.jsxs)("button",{className:`filter-pill ${"photo"===j?"active":""}`,onClick:()=>k("photo"),children:[(0,b.jsx)(m,{size:12})," ",a("vybe.photos")]}),(0,b.jsxs)("button",{className:`filter-pill ${"video"===j?"active":""}`,onClick:()=>k("video"),children:[(0,b.jsx)(n.Play,{size:12})," ",a("vybe.reels")]})]})]})}),(0,b.jsxs)("div",{style:{maxWidth:680,margin:"0 auto",padding:"0.75rem 4% 5rem"},children:[u&&(0,b.jsxs)("div",{style:{textAlign:"center",padding:"5rem 0"},children:[(0,b.jsx)(l.Loader2,{style:{width:32,height:32,margin:"0 auto 12px",animation:"spin 1s linear infinite",color:"var(--sn-text)"}}),(0,b.jsx)("p",{style:{color:"var(--sn-subtle)",fontSize:14},children:a("vybe.loading")})]}),!u&&A&&(0,b.jsxs)("div",{style:{textAlign:"center",padding:"5rem 0"},children:[(0,b.jsx)("div",{style:{width:56,height:56,borderRadius:"50%",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"},children:(0,b.jsx)(r.RefreshCw,{size:22,color:"#EF4444"})}),(0,b.jsx)("p",{style:{color:"var(--sn-subtle)",fontSize:14,marginBottom:16},children:A}),(0,b.jsx)("button",{onClick:H,style:{padding:"10px 24px",background:"var(--sn-primary)",color:"var(--sn-primary-fg)",border:"none",borderRadius:999,fontWeight:700,cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:14},children:a("vybe.retry")})]}),!u&&!A&&0===M.length&&(0,b.jsxs)("div",{style:{textAlign:"center",padding:"5rem 0"},children:[(0,b.jsx)("div",{style:{width:64,height:64,borderRadius:"20px",background:"rgba(29,78,216,0.08)",border:"1px solid rgba(29,78,216,0.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"},children:(0,b.jsx)(q.Star,{size:28,color:"rgba(29,78,216,0.4)"})}),(0,b.jsx)("p",{style:{color:"var(--sn-subtle)",fontSize:14},children:s?a("vybe.noResults"):a("vybe.noPosts")}),s&&(0,b.jsx)("button",{onClick:()=>t(""),style:{marginTop:12,padding:"8px 20px",background:"var(--sn-bg)",border:"1px solid rgba(255,255,255,0.1)",color:"var(--sn-muted)",borderRadius:999,cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:13},children:a("vybe.allPosts")})]}),!u&&!A&&M.length>0&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:M.slice(0,E).map(c=>(0,b.jsx)(z,{post:c,liked:C.has(c.id),onLike:()=>I(c),onShare:()=>L(c),copied:J===c.id,ago:G,t:a},c.id))}),E<M.length&&(0,b.jsx)("div",{style:{textAlign:"center",marginTop:"1.5rem"},children:(0,b.jsxs)("button",{onClick:()=>F(a=>a+12),style:{padding:"11px 32px",background:"var(--sn-bg)",border:"1.5px solid #E2E8F0",color:"var(--sn-muted)",borderRadius:999,cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:14,fontWeight:600,transition:"all .2s"},onMouseOver:a=>{a.currentTarget.style.borderColor="rgba(29,78,216,.4)",a.currentTarget.style.color="#1D4ED8"},onMouseOut:a=>{a.currentTarget.style.borderColor="var(--sn-border)",a.currentTarget.style.color="#6B7280"},children:[a("vybe.loadMore")," · ",M.length-E," ",a("vybe.totalPosts").toLowerCase()]})})]})]}),(0,b.jsx)(h.SiteFooter,{})]})}],51092)}];

//# sourceMappingURL=app_vybe_page_tsx_0-jieu4._.js.map