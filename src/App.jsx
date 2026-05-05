import { useState, useRef, useEffect, useReducer } from "react";

const C={primary:"#185FA5",primaryLight:"#E6F1FB",success:"#3B6D11",successLight:"#EAF3DE",warning:"#BA7517",warningLight:"#FAEEDA",orange:"#D85A30",orangeLight:"#FAECE7",danger:"#A32D2D",dangerLight:"#FCEBEB",gray:"#5F5E5A",grayLight:"#F1EFE8",navy:"#0F2744",purple:"#5340b7",purpleLight:"#f1effe"};
const MONTHS=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WDAYS=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const IS={width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid #ddd",fontSize:13,boxSizing:"border-box"};

const SC=[
  {id:"calderas",titulo:"1. CALDERAS",items:["Análisis de la combustión","Comprobar manómetro de caldera","Comprobar termómetro de caldera","Contrastar termostatos mando y seguridad","Limpieza exterior"],ticket:true},
  {id:"quemadores",titulo:"2. QUEMADORES",items:["Comprobación visual de la combustión","Limpieza exterior"]},
  {id:"acumuladores",titulo:"3. ACUMULADORES",items:["Revisar depósito acumulador","Realizar purga de fondos","Purga de válvulas de drenaje","Comprobar temperatura de acumulación"]},
  {id:"intercambiadores",titulo:"4. INTERCAMBIADORES",items:["Comprobar apriete sistema tornillos","Comprobar presión entrada y salida","Comprobar temperatura de entrada y salida"]},
  {id:"bombas",titulo:"5. BOMBAS DE CIRCULACIÓN",items:["Comprobar funcionamiento (ruidos)","Cambiar bomba de funcionamiento","Verificar estado de los anclajes","Comprobar ausencia fugas (juntas, prensa)","Comprobar columna manométrica de detección"]},
  {id:"gas",titulo:"6. INSTALACIÓN DE GAS",items:["Revisar estado tuberías vistas","Comprobar presión de utilización"]},
  {id:"cuadros",titulo:"7. CUADROS ELÉCTRICOS",items:["Revisar estado fusibles","Comprobar pilotos señalización y alarma","Verificar conexiones eléctricas"]},
  {id:"regulacion",titulo:"8. REGULACIÓN Y CONTROL",items:["Verificar MODEM y conexión telefónica","Comprobar parámetros operativos","Sincronización lecturas consumo"]},
  {id:"sala",titulo:"9. SALA DE CALDERAS",items:["Comprobar estado sala","Comprobar ventilación","Comprobar iluminación (sala y emergencia)","Limpieza sala (semestral)"]},
];
const SG=[
  {id:"gp_gen",titulo:"ESTADO GENERAL",items:[{d:"Inspección visual estado general",f:"Según estado"},{d:"Limpieza externa del equipo",f:"3"},{d:"Comprobación alineamiento motor-bomba",f:"3"},{d:"Limpieza ventilador del motor",f:"3"}]},
  {id:"gp_bom",titulo:"BOMBAS DE PRESIÓN",items:[{d:"Ausencia fugas por sello mecánico",f:"3"},{d:"Ausencia de ruidos anómalos",f:"3"}]},
  {id:"gp_cal",titulo:"CALDERÍN",items:[{d:"Estado general y presión de aire en membrana",f:"3"}]},
  {id:"gp_man",titulo:"MANGUITOS DE UNIÓN",items:[{d:"Estado y elasticidad",f:"3"}]},
  {id:"gp_hid",titulo:"CONEXIONES HIDRÁULICAS",items:[{d:"Estado y ausencia de fugas",f:"3"}]},
  {id:"gp_ele",titulo:"CONEXIONES ELÉCTRICAS",items:[{d:"Estado y apriete de bornas",f:"3"},{d:"Tensiones y consumos eléctricos",f:"3"}]},
  {id:"gp_alj",titulo:"ALJIBE",items:[{d:"Existencia de lodos en fondo",f:"12"}]},
];
const SL=[
  {id:"leg_rev",titulo:"REVISIÓN GENERAL",items:[{d:"Inspección visual sistema de agua",f:"1"},{d:"Temperatura puntos terminales",f:"1"},{d:"Medición cloro residual libre",f:"1"},{d:"Purga válvulas de fondo acumuladores",f:"3"},{d:"Revisión estado de filtros",f:"3"}]},
  {id:"leg_tra",titulo:"TRATAMIENTO Y DESINFECCIÓN",items:[{d:"Nivel de producto biocida",f:"1"},{d:"Verificación equipo dosificador",f:"1"},{d:"Estado sondas de temperatura",f:"3"},{d:"Desinfección química o térmica",f:"3"},{d:"Muestras para análisis microbiológico",f:"6"}]},
  {id:"leg_ins",titulo:"ESTADO INSTALACIÓN",items:[{d:"Revisión tuberías y aislamientos",f:"6"},{d:"Difusores y grifería",f:"6"},{d:"Torres de refrigeración (si aplica)",f:"3"},{d:"Libro de registro y documentación",f:"3"}]},
];

function initCh(secs){const ch={};secs.forEach(s=>s.items.forEach((_,i)=>{ch[s.id+"_"+i+"_si"]=false;ch[s.id+"_"+i+"_no"]=false;ch[s.id+"_"+i+"_obs"]="";}));return ch;}
function initMF(){return{clienteId:"",emplazamiento:"",poblacion:"",provincia:"",fecha:"",tipoMant:"calderas",checks:initCh(SC),otrosDesc:"",otrosReal:"",tAC:"",tAR:"",tIC:"",tIR:"",tRC:"",tRR:"",g1:"",g2:"",l1a:"",l1b:"",l2a:"",l2b:"",c1a:"",c1b:"",c2a:"",c2b:"",firmaTec:null,firmaOp:null,ticket:null};}

const INIT={
  users:[{id:1,nombre:"Admin Garpi",usuario:"admin",password:"admin123",rol:"admin"},{id:2,nombre:"Carlos Pérez",usuario:"carlos",password:"op123",rol:"operario"},{id:3,nombre:"Miguel Torres",usuario:"miguel",password:"op123",rol:"operario"},{id:4,nombre:"Juan Ruiz",usuario:"juan",password:"op123",rol:"operario"}],
  clientes:[{id:1,nombre:"Restaurante El Faro",direccion:"C/ Mar 12, Sevilla",emps:["Cocina principal","Sala calderas B1"]},{id:2,nombre:"Hotel Guadalquivir",direccion:"Avda. Borbolla 5, Sevilla",emps:["Sala calderas PB","Cuarto técnico P3"]},{id:3,nombre:"Bar La Triana",direccion:"C/ Betis 22, Sevilla",emps:["Cocina","Terraza"]}],
  tareas:[
    {id:1,clienteId:1,titulo:"Revisión instalación gas",descripcion:"Inspección anual",asignadoA:2,fecha:"2026-04-28",estado:"pendiente",aceptada:false,dieta:"12",tipo:"correctivo"},
    {id:2,clienteId:2,titulo:"Mantenimiento caldera",descripcion:"Sustitución válvula",asignadoA:3,fecha:"2026-04-29",estado:"pendiente",aceptada:false,dieta:"",tipo:"correctivo"},
    {id:3,clienteId:3,titulo:"Revisión quemadores",descripcion:"Limpieza y ajuste",asignadoA:2,fecha:"2026-04-15",estado:"completada",aceptada:true,dieta:"12",tipo:"correctivo"},
    {id:4,clienteId:1,titulo:"Mantenimiento preventivo",descripcion:"Ficha mensual",asignadoA:2,fecha:"2026-04-20",estado:"completada",aceptada:true,dieta:"",tipo:"preventivo"},
  ],
  partes:[{id:1,tareaId:3,operarioId:2,clienteId:3,fecha:"2026-04-15",obra:"Bar La Triana",tipo:"correctivo",lineas:[{trabajador:"Carlos Pérez",trabajosRealizados:"Limpieza quemadores",materialesUtilizados:"Desengrasante 2L"}],observaciones:"Revisión en 6 meses",horas:"3",firmaCliente:null,firmaTrabajador:null,fotos:[],estado:"firmado"}],
  partesM:[],
};

function reducer(s,a){
  switch(a.type){
    case"ACEPTAR": return{...s,tareas:s.tareas.map(t=>t.id===a.id?{...t,aceptada:true,estado:"en_curso"}:t)};
    case"ADD_PARTE": return{...s,partes:[...s.partes,a.p],tareas:s.tareas.map(t=>t.id===a.p.tareaId?{...t,estado:"completada"}:t)};
    case"ADD_PARTE_M": return{...s,partesM:[...s.partesM,a.p],tareas:s.tareas.map(t=>t.id===a.p.tareaId?{...t,estado:"completada"}:t)};
    case"ADD_TAREA": return{...s,tareas:[...s.tareas,a.t]};
    case"UPD_TAREA": return{...s,tareas:s.tareas.map(t=>t.id===a.t.id?{...a.t}:t)};
    case"DEL_TAREA": return{...s,tareas:s.tareas.filter(t=>t.id!==a.id)};
    case"ADD_CLI": return{...s,clientes:[...s.clientes,a.c]};
    case"UPD_CLI": return{...s,clientes:s.clientes.map(c=>c.id===a.c.id?{...a.c}:c)};
    case"DEL_CLI": return{...s,clientes:s.clientes.filter(c=>c.id!==a.id)};
    case"ADD_USER": return{...s,users:[...s.users,a.u]};
    case"UPD_USER": return{...s,users:s.users.map(u=>u.id===a.u.id?{...u,...a.u}:u)};
    case"DEL_USER": return{...s,users:s.users.filter(u=>u.id!==a.id)};
    case"ADD_FOTO": return{...s,partes:s.partes.map(p=>p.id===a.pid?{...p,fotos:[...(p.fotos||[]),a.f]}:p)};
    case"ADD_FOTO_M": return{...s,partesM:s.partesM.map(p=>p.id===a.pid?{...p,fotos:[...(p.fotos||[]),a.f]}:p)};
    default: return s;
  }
}

function SigPad({label,onSave}){
  const ref=useRef(null);
  const dr=useRef(false);
  const[signed,setSigned]=useState(false);
  const[saved,setSaved]=useState(false);
  useEffect(()=>{
    const c=ref.current,x=c.getContext("2d");
    c.width=c.offsetWidth||300;
    x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
    x.strokeStyle="#111";x.lineWidth=2.5;x.lineCap="round";x.lineJoin="round";
  },[]);
  const gp=(e,c)=>{const r=c.getBoundingClientRect(),src=e.touches?e.touches[0]:e;return{x:(src.clientX-r.left)*(c.width/r.width),y:(src.clientY-r.top)*(c.height/r.height)};};
  const ds=e=>{e.preventDefault();dr.current=true;const c=ref.current,x=c.getContext("2d"),p=gp(e,c);x.beginPath();x.moveTo(p.x,p.y);setSaved(false);};
  const dm=e=>{e.preventDefault();if(!dr.current)return;const c=ref.current,x=c.getContext("2d"),p=gp(e,c);x.lineTo(p.x,p.y);x.stroke();setSigned(true);};
  const de=e=>{e.preventDefault();dr.current=false;};
  const clr=()=>{const c=ref.current,x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);setSigned(false);setSaved(false);};
  const save=()=>{onSave(ref.current.toDataURL());setSaved(true);};
  return(
    <div style={{margin:"12px 0"}}>
      <p style={{fontSize:13,color:C.gray,margin:"0 0 6px",fontWeight:500}}>{label}</p>
      <canvas ref={ref} width={300} height={110}
        style={{border:"2px solid "+(signed?C.primary:"#ccc"),borderRadius:10,touchAction:"none",cursor:"crosshair",display:"block",width:"100%",maxWidth:400,background:"#fff",boxSizing:"border-box"}}
        onMouseDown={ds} onMouseMove={dm} onMouseUp={de} onMouseLeave={de}
        onTouchStart={ds} onTouchMove={dm} onTouchEnd={de}/>
      <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
        <button onClick={clr} style={{fontSize:13,padding:"6px 14px",borderRadius:8,border:"1px solid #ccc",background:"#fff",cursor:"pointer",color:C.gray}}>Borrar</button>
        {signed&&!saved&&<button onClick={save} style={{fontSize:13,padding:"6px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",cursor:"pointer",fontWeight:500}}>Guardar firma</button>}
        {saved&&<span style={{fontSize:13,color:C.success,fontWeight:500}}>✓ Firma guardada</span>}
      </div>
    </div>
  );
}

function Bdg({text,color,bg}){return <span style={{fontSize:11,padding:"2px 8px",borderRadius:12,background:bg,color,fontWeight:500}}>{text}</span>;}
function EBdg({estado}){const m={pendiente:[C.orange,C.orangeLight,"Pendiente"],en_curso:[C.primary,C.primaryLight,"En curso"],completada:[C.success,C.successLight,"Completada"],firmado:[C.success,C.successLight,"Firmado"]};const[col,bg,txt]=m[estado]||[C.gray,C.grayLight,"—"];return <Bdg text={txt} color={col} bg={bg}/>;}
function TBdg({tipo}){return tipo==="preventivo"?<Bdg text="Preventivo" color={C.purple} bg={C.purpleLight}/>:<Bdg text="Correctivo" color={C.primary} bg={C.primaryLight}/>;}
function Box({title,children}){return <div style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:16,marginBottom:12}}><h3 style={{margin:"0 0 10px",fontWeight:500,fontSize:14,color:C.navy}}>{title}</h3>{children}</div>;}

function TareaCard({t,showEdit,sess,gc,gu,st,onEdit,onEliminar,onAceptar,onCrearParte}){
  const cli=gc(t.clienteId),op=gu(t.asignadoA);
  const pe=st.partes.find(p=>p.tareaId===t.id)||st.partesM.find(p=>p.tareaId===t.id);
  return(
    <div style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:14,marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:500,fontSize:14}}>{t.titulo}</div>
          <div style={{fontSize:12,color:C.gray,marginTop:2}}>{cli.nombre} · {t.fecha}</div>
          <div style={{fontSize:12,color:C.gray}}>{t.descripcion}</div>
          {sess.rol==="admin"&&<div style={{fontSize:12,color:C.primary,marginTop:2}}>Operario: {op.nombre}</div>}
          {t.dieta&&<div style={{fontSize:12,color:C.warning,marginTop:2}}>Dieta: {t.dieta} €</div>}
          <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <EBdg estado={t.estado}/>
            <TBdg tipo={t.tipo||"correctivo"}/>
            {t.aceptada?<Bdg text="Aceptada" color={C.success} bg={C.successLight}/>:<Bdg text="Sin aceptar" color={C.gray} bg={C.grayLight}/>}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
          {showEdit&&sess.rol==="admin"&&(
            <button onClick={()=>onEdit(t)} style={{padding:"5px 10px",borderRadius:7,border:"1px solid "+C.primary,background:"#fff",color:C.primary,fontSize:12,cursor:"pointer"}}>Editar</button>
          )}
          {showEdit&&sess.rol==="admin"&&(
            <button onClick={()=>onEliminar(t.id)} style={{padding:"5px 10px",borderRadius:7,border:"none",background:C.dangerLight,color:C.danger,fontSize:12,cursor:"pointer"}}>Eliminar</button>
          )}
          {sess.rol==="operario"&&!t.aceptada&&t.asignadoA===sess.id&&(
            <button onClick={()=>onAceptar(t.id)} style={{padding:"6px 12px",borderRadius:7,border:"none",background:C.success,color:"#fff",fontSize:12,cursor:"pointer"}}>Aceptar</button>
          )}
          {sess.rol==="operario"&&t.aceptada&&!pe&&t.asignadoA===sess.id&&(
            <button onClick={()=>onCrearParte(t)} style={{padding:"6px 12px",borderRadius:7,border:"none",background:C.primary,color:"#fff",fontSize:12,cursor:"pointer"}}>Crear parte</button>
          )}
          {pe&&<Bdg text="Parte creado" color={C.success} bg={C.successLight}/>}
        </div>
      </div>
    </div>
  );
}

function Clientes({st,dispatch}){
  const[show,setShow]=useState(false);const[edit,setEdit]=useState(null);
  const[nom,setNom]=useState("");const[dir,setDir]=useState("");const[emps,setEmps]=useState("");
  const guardar=()=>{if(!nom.trim())return;dispatch({type:"ADD_CLI",c:{id:Date.now(),nombre:nom.trim(),direccion:dir.trim(),emps:emps.split(",").map(x=>x.trim()).filter(Boolean)}});setNom("");setDir("");setEmps("");setShow(false);};
  const guardarEdit=()=>{if(!edit||!edit.nombre.trim())return;dispatch({type:"UPD_CLI",c:{id:edit.id,nombre:edit.nombre.trim(),direccion:(edit.dir||"").trim(),emps:(edit.emps||"").split(",").map(x=>x.trim()).filter(Boolean)}});setEdit(null);};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{margin:0,fontWeight:500,fontSize:20}}>Clientes</h2>
        <button onClick={()=>{setShow(true);setEdit(null);}} style={{padding:"8px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>+ Nuevo cliente</button>
      </div>
      {show&&!edit&&(
        <div style={{background:"#fff",border:"0.5px solid #ddd",borderRadius:10,padding:16,marginBottom:16}}>
          <h3 style={{margin:"0 0 10px",fontWeight:500}}>Nuevo cliente</h3>
          <div style={{marginBottom:8}}><input placeholder="Nombre" value={nom} onChange={e=>setNom(e.target.value)} style={IS}/></div>
          <div style={{marginBottom:8}}><input placeholder="Dirección" value={dir} onChange={e=>setDir(e.target.value)} style={IS}/></div>
          <div style={{marginBottom:8}}><input placeholder="Emplazamientos separados por coma" value={emps} onChange={e=>setEmps(e.target.value)} style={IS}/></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={guardar} style={{padding:"7px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>Guardar</button>
            <button onClick={()=>setShow(false)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #ddd",background:"#fff",fontSize:13,cursor:"pointer",color:C.gray}}>Cancelar</button>
          </div>
        </div>
      )}
      {edit&&(
        <div style={{background:"#fff",border:"1.5px solid "+C.primary,borderRadius:10,padding:16,marginBottom:16}}>
          <h3 style={{margin:"0 0 10px",fontWeight:500}}>Editar cliente</h3>
          <div style={{marginBottom:8}}><input placeholder="Nombre" value={edit.nombre} onChange={e=>setEdit(f=>({...f,nombre:e.target.value}))} style={IS}/></div>
          <div style={{marginBottom:8}}><input placeholder="Dirección" value={edit.dir||""} onChange={e=>setEdit(f=>({...f,dir:e.target.value}))} style={IS}/></div>
          <div style={{marginBottom:8}}><input placeholder="Emplazamientos separados por coma" value={edit.emps||""} onChange={e=>setEdit(f=>({...f,emps:e.target.value}))} style={IS}/></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={guardarEdit} style={{padding:"7px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>Guardar cambios</button>
            <button onClick={()=>setEdit(null)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #ddd",background:"#fff",fontSize:13,cursor:"pointer",color:C.gray}}>Cancelar</button>
          </div>
        </div>
      )}
      {st.clientes.map(c=>(
        <div key={c.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:500,fontSize:14}}>{c.nombre}</div>
              <div style={{fontSize:12,color:C.gray}}>{c.direccion}</div>
              {c.emps&&c.emps.length>0&&<div style={{fontSize:12,color:C.primary,marginTop:2}}>Emplazamientos: {c.emps.join(" · ")}</div>}
              <div style={{fontSize:12,color:C.gray,marginTop:2}}>{st.tareas.filter(t=>t.clienteId===c.id).length} tarea(s)</div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>{setEdit({id:c.id,nombre:c.nombre,dir:c.direccion,emps:(c.emps||[]).join(", ")});setShow(false);}} style={{padding:"5px 10px",borderRadius:7,border:"1px solid "+C.primary,background:"#fff",color:C.primary,fontSize:12,cursor:"pointer"}}>Editar</button>
              <button onClick={()=>dispatch({type:"DEL_CLI",id:c.id})} style={{padding:"5px 10px",borderRadius:7,border:"none",background:C.dangerLight,color:C.danger,fontSize:12,cursor:"pointer"}}>Eliminar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Dietas({st,gc,gu,pdfFn}){
  const[fM,setFM]=useState(-1);const[fA,setFA]=useState(-1);
  const all=st.tareas.filter(t=>t.dieta&&parseFloat(t.dieta)>0);
  const dt=all.filter(t=>{const[y,m]=t.fecha.split("-").map(Number);return(fA===-1||y===fA)&&(fM===-1||m-1===fM);});
  const tot=dt.reduce((s,t)=>s+(parseFloat(t.dieta)||0),0);
  const pm={};dt.forEach(t=>{const[y,m]=t.fecha.split("-");const k=MONTHS[+m-1]+" "+y;pm[k]=(pm[k]||0)+(parseFloat(t.dieta)||0);});
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{margin:0,fontWeight:500,fontSize:20}}>Informe de dietas</h2>
        <button onClick={pdfFn} style={{padding:"8px 14px",borderRadius:8,border:"none",background:C.danger,color:"#fff",fontSize:13,cursor:"pointer"}}>PDF</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <select value={fA} onChange={e=>setFA(+e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #ddd",fontSize:13}}>
          <option value={-1}>Todos los años</option>
          {[2024,2025,2026,2027,2028,2029,2030].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={fM} onChange={e=>setFM(+e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #ddd",fontSize:13}}>
          <option value={-1}>Todos los meses</option>
          {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:20}}>
        <div style={{background:C.warningLight,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:12,color:C.warning,marginBottom:4}}>Total dietas</div><div style={{fontSize:26,fontWeight:500,color:C.warning}}>{tot.toFixed(2)} €</div></div>
        <div style={{background:C.primaryLight,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:12,color:C.primary,marginBottom:4}}>Con dieta</div><div style={{fontSize:26,fontWeight:500,color:C.primary}}>{dt.length}</div></div>
      </div>
      {Object.keys(pm).length>0&&<div style={{marginBottom:16}}><h3 style={{fontWeight:500,fontSize:15,margin:"0 0 10px"}}>Por mes</h3>{Object.entries(pm).map(([mes,v])=><div key={mes} style={{display:"flex",justifyContent:"space-between",background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:8,padding:"10px 14px",marginBottom:6}}><span>{mes}</span><span style={{fontWeight:500,color:C.warning}}>{v.toFixed(2)} €</span></div>)}</div>}
      <h3 style={{fontWeight:500,fontSize:15,margin:"0 0 10px"}}>Detalle</h3>
      {dt.length===0&&<div style={{fontSize:13,color:C.gray}}>Sin dietas para el período seleccionado.</div>}
      {dt.map(t=>{const cli=gc(t.clienteId),op=gu(t.asignadoA);return(
        <div key={t.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:8,padding:"10px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:500}}>{t.titulo}</div><div style={{fontSize:12,color:C.gray}}>{op.nombre} · {cli.nombre} · {t.fecha}</div></div>
          <span style={{fontWeight:500,color:C.warning,fontSize:14}}>{t.dieta} €</span>
        </div>
      );})}
    </div>
  );
}

export default function App(){
  const[st,dispatch]=useReducer(reducer,INIT);
  const[sess,setSess]=useState(null);
  const[lu,setLu]=useState("");const[lp,setLp]=useState("");const[le,setLe]=useState("");
  const[sec,setSec]=useState("dashboard");
  const[selT,setSelT]=useState(null);const[selDay,setSelDay]=useState(null);
  const[calY,setCalY]=useState(2026);const[calM,setCalM]=useState(3);
  const[showNT,setShowNT]=useState(false);const[editT,setEditT]=useState(null);
  const[showNO,setShowNO]=useState(false);const[editOp,setEditOp]=useState(null);
  const[offline,setOffline]=useState(false);
  const[pf,setPf]=useState({lineas:[{trab:"",mat:""}],obs:"",hrs:"",fCli:null,fTrab:null});
  const[mf,setMf]=useState(initMF());
  const[no,setNo]=useState({nombre:"",usuario:"",password:""});
  const[ntCli,setNtCli]=useState("");const[ntTit,setNtTit]=useState("");const[ntDes,setNtDes]=useState("");
  const[ntOp,setNtOp]=useState("");const[ntFec,setNtFec]=useState("");const[ntDie,setNtDie]=useState("");
  const[ntTip,setNtTip]=useState("correctivo");
  const[menuOpen,setMenuOpen]=useState(false);

  const doLogin=()=>{const u=st.users.find(u=>u.usuario===lu&&u.password===lp);if(u){setSess(u);setSec("dashboard");setLe("");}else setLe("Usuario o contraseña incorrectos");};
  const doLogout=()=>{setSess(null);setLu("");setLp("");setLe("");};
  const gc=id=>st.clientes.find(c=>c.id===id)||{};
  const gu=id=>st.users.find(u=>u.id===id)||{};
  const gt=id=>st.tareas.find(t=>t.id===id)||{};
  const myT=sess?st.tareas.filter(t=>sess.rol==="admin"||t.asignadoA===sess.id):[];
  const myP=sess?st.partes.filter(p=>sess.rol==="admin"||p.operarioId===sess.id):[];
  const myM=sess?st.partesM.filter(p=>sess.rol==="admin"||p.operarioId===sess.id):[];

  const crearTarea=()=>{
    const cid=Number(ntCli),aid=Number(ntOp);
    if(!cid){alert("Selecciona un cliente");return;}
    if(!ntTit.trim()){alert("Escribe un título");return;}
    if(!aid){alert("Selecciona un operario");return;}
    dispatch({type:"ADD_TAREA",t:{id:Date.now(),clienteId:cid,asignadoA:aid,titulo:ntTit.trim(),descripcion:ntDes,fecha:ntFec,dieta:ntDie,tipo:ntTip,estado:"pendiente",aceptada:false}});
    setNtCli("");setNtTit("");setNtDes("");setNtOp("");setNtFec("");setNtDie("");setNtTip("correctivo");
    setShowNT(false);
  };

  const subC=tid=>{
    const tarea=gt(tid);
    const p={id:Date.now(),tareaId:tid,operarioId:sess.id,clienteId:tarea.clienteId,fecha:new Date().toISOString().split("T")[0],obra:gc(tarea.clienteId).nombre||"",tipo:"correctivo",lineas:pf.lineas.map(l=>({trabajador:sess.nombre,trabajosRealizados:l.trab,materialesUtilizados:l.mat})),observaciones:pf.obs,horas:pf.hrs,firmaCliente:pf.fCli,firmaTrabajador:pf.fTrab,fotos:[],estado:pf.fCli&&pf.fTrab?"firmado":"borrador"};
    dispatch({type:"ADD_PARTE",p});setSec("mis_tareas");setSelT(null);setPf({lineas:[{trab:"",mat:""}],obs:"",hrs:"",fCli:null,fTrab:null});
  };
  const subM=tid=>{
    const tarea=gt(tid);
    const p={id:Date.now(),tareaId:tid,operarioId:sess.id,clienteId:tarea.clienteId,fecha:mf.fecha||new Date().toISOString().split("T")[0],tipo:"preventivo",...mf,estado:mf.firmaTec&&mf.firmaOp?"firmado":"borrador"};
    dispatch({type:"ADD_PARTE_M",p});setSec("mis_tareas");setSelT(null);setMf(initMF());
  };
  const addL=()=>setPf(f=>({...f,lineas:[...f.lineas,{trab:"",mat:""}]}));
  const updL=(i,k,v)=>setPf(f=>{const l=[...f.lineas];l[i]={...l[i],[k]:v};return{...f,lineas:l};});
  const updCh=(k,v)=>setMf(f=>({...f,checks:{...f.checks,[k]:v}}));
  const chgTipo=tipo=>{let ch={};if(tipo==="calderas")ch=initCh(SC);else if(tipo==="grupos")ch=initCh(SG);else if(tipo==="legionella")ch=initCh(SL);setMf(f=>({...f,tipoMant:tipo,checks:ch,ticket:null}));};

  const mkPDF=html=>{const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();};

  const pdfC=p=>{
    const cli=gc(p.clienteId),tarea=gt(p.tareaId);
    mkPDF("<!DOCTYPE html><html><head><meta charset='utf-8'><style>body{font-family:Arial;margin:20px;font-size:12px}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #000;padding:5px}th{background:#f0f0f0}img{max-width:160px;max-height:65px}</style></head><body>"
      +"<div style='display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:12px'><div><b>GARPI S.L.</b><br>C/ Atenas Bloq.5-L1, 41089 Montequinto<br>Tlf: 954 12 32 55</div><div style='text-align:right'><h2 style='margin:0'>PARTE CORRECTIVO</h2><p>N\xba "+p.id+" | "+p.fecha+"</p></div></div>"
      +"<p><b>Cliente:</b> "+p.obra+"&nbsp;<b>Dir:</b> "+(cli.direccion||"")+"</p><p><b>Dieta:</b> "+(tarea.dieta?tarea.dieta+" \u20ac":"No aplica")+"</p>"
      +"<table><thead><tr><th>Trabajador</th><th>Trabajos realizados</th><th>Materiales</th></tr></thead><tbody>"
      +p.lineas.map(l=>"<tr><td>"+l.trabajador+"</td><td>"+l.trabajosRealizados+"</td><td>"+l.materialesUtilizados+"</td></tr>").join("")
      +"</tbody></table><table><tr><td width='35%'><b>Obs:</b><br>"+p.observaciones+"</td><td width='10%'><b>Horas:</b><br>"+p.horas+"h</td>"
      +"<td><b>Firma cliente:</b><br>"+(p.firmaCliente?"<img src='"+p.firmaCliente+"'/>":" ")+"</td>"
      +"<td><b>Firma empresa:</b><br>"+(p.firmaTrabajador?"<img src='"+p.firmaTrabajador+"'/>":" ")+"</td></tr></table></body></html>");
  };

  const pdfM=pm=>{
    const cli=gc(pm.clienteId),op=gu(pm.operarioId);
    let secsU=SC;if(pm.tipoMant==="grupos")secsU=SG;else if(pm.tipoMant==="legionella")secsU=SL;
    const rows=pm.tipoMant==="otros"?"<tr><td colspan='5'><b>"+(pm.otrosDesc||"")+"</b><br>"+(pm.otrosReal||"")+"</td></tr>":secsU.map(s=>{const hf=s.items[0]&&typeof s.items[0]==="object";return"<tr><td colspan='5' style='background:#ddd;font-weight:bold'>"+s.titulo+"</td></tr><tr><th>Op</th>"+(hf?"<th>Frec</th>":"")+"<th>SI</th><th>NO</th><th>Obs</th></tr>"+s.items.map((item,i)=>{const d=typeof item==="object"?item.d:item,f=typeof item==="object"?item.f:null;return"<tr><td>"+d+"</td>"+(f!==null?"<td>"+f+"</td>":"")+"<td>"+(pm.checks&&pm.checks[s.id+"_"+i+"_si"]?"&#10003;":"")+"</td><td>"+(pm.checks&&pm.checks[s.id+"_"+i+"_no"]?"&#10003;":"")+"</td><td>"+(pm.checks&&pm.checks[s.id+"_"+i+"_obs"]||"")+"</td></tr>";}).join("");}).join("");
    mkPDF("<!DOCTYPE html><html><head><meta charset='utf-8'><style>body{font-family:Arial;margin:20px;font-size:11px}table{width:100%;border-collapse:collapse;margin:6px 0}th,td{border:1px solid #000;padding:4px}th{background:#f0f0f0}img{max-width:150px;max-height:60px}</style></head><body>"
      +"<div style='display:flex;justify-content:space-between;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:10px'><div><b>GARPI S.L.</b></div><div><b>FICHA MANTENIMIENTO — "+(pm.tipoMant==="calderas"?"Sala de Calderas":pm.tipoMant==="grupos"?"Grupos de Presión":pm.tipoMant==="legionella"?"Legionella":"Otros")+"</b></div></div>"
      +"<p><b>Instalación:</b> "+(cli.nombre||"")+" &nbsp;<b>Emplazamiento:</b> "+(pm.emplazamiento||"")+"</p>"
      +"<p><b>Población:</b> "+(pm.poblacion||"")+" &nbsp;<b>Provincia:</b> "+(pm.provincia||"")+" &nbsp;<b>Operario:</b> "+(op.nombre||"")+" &nbsp;<b>Fecha:</b> "+(pm.fecha||"")+"</p>"
      +"<table>"+rows+"</table>"+(pm.ticket?"<p><b>Ticket:</b><br><img src='"+pm.ticket+"'/></p>":"")
      +(pm.tipoMant==="calderas"?"<table><tr><th colspan='2'>PARÁMETROS</th><th>Control Planta</th><th>Real Equipos</th></tr><tr><td colspan='2'>Temp. acumulación ACS</td><td>"+(pm.tAC||"")+" \xb0C</td><td>"+(pm.tAR||"")+" \xb0C</td></tr><tr><td colspan='2'>Temp. impulsión primario</td><td>"+(pm.tIC||"")+" \xb0C</td><td>"+(pm.tIR||"")+" \xb0C</td></tr><tr><td colspan='2'>Temp. retorno ACS</td><td>"+(pm.tRC||"")+" \xb0C</td><td>"+(pm.tRR||"")+" \xb0C</td></tr></table><table><tr><th colspan='2'>LECTURAS</th><th>Contador 1</th><th>Contador 2</th></tr><tr><td colspan='2'>Contador gas</td><td>"+(pm.g1||"")+"</td><td>"+(pm.g2||"")+"</td></tr><tr><td colspan='2'>Libre 1</td><td>"+(pm.l1a||"")+"</td><td>"+(pm.l1b||"")+"</td></tr><tr><td colspan='2'>Libre 2</td><td>"+(pm.l2a||"")+"</td><td>"+(pm.l2b||"")+"</td></tr></table><table><tr><th colspan='2'>CORRECTORES</th><th>Corrector 1</th><th>Corrector 2</th></tr><tr><td colspan='2'>Energía 1</td><td>"+(pm.c1a||"")+"</td><td>"+(pm.c1b||"")+"</td></tr><tr><td colspan='2'>Energía 2</td><td>"+(pm.c2a||"")+"</td><td>"+(pm.c2b||"")+"</td></tr></table>":"")
      +"<br><table><tr><td style='width:50%'><b>Firma cliente:</b><br>"+(pm.firmaTec?"<img src='"+pm.firmaTec+"'/>":" ")+"</td><td><b>Firma operario-mantenedor:</b><br>"+(pm.firmaOp?"<img src='"+pm.firmaOp+"'/>":" ")+"</td></tr></table></body></html>");
  };

  const pdfMensual=()=>{
    const tm=st.tareas.filter(t=>{const[y,m]=t.fecha.split("-").map(Number);return y===calY&&m===calM+1;});
    const td=tm.reduce((s,t)=>s+(parseFloat(t.dieta)||0),0);
    mkPDF("<!DOCTYPE html><html><head><meta charset='utf-8'><style>body{font-family:Arial;margin:20px;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:5px}th{background:#f0f0f0}</style></head><body><h2>GARPI S.L. \u2014 Informe: "+MONTHS[calM]+" "+calY+"</h2><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Cliente</th><th>Operario</th><th>Trabajo</th><th>Estado</th><th>Dieta</th><th>Horas</th></tr></thead><tbody>"+tm.map(t=>{const c=gc(t.clienteId),o=gu(t.asignadoA),p=st.partes.find(p=>p.tareaId===t.id);return"<tr><td>"+t.fecha+"</td><td>"+(t.tipo||"")+"</td><td>"+(c.nombre||"")+"</td><td>"+(o.nombre||"")+"</td><td>"+t.titulo+"</td><td>"+t.estado+"</td><td>"+(t.dieta?t.dieta+" \u20ac":"\u2014")+"</td><td>"+(p?p.horas+"h":"\u2014")+"</td></tr>";}).join("")+"</tbody></table><p><b>Total dietas: "+td.toFixed(2)+" \u20ac \u2014 Total tareas: "+tm.length+"</b></p></body></html>");
  };

  const pdfDietas=()=>{
    const dt=st.tareas.filter(t=>t.dieta&&parseFloat(t.dieta)>0);
    const tot=dt.reduce((s,t)=>s+(parseFloat(t.dieta)||0),0);
    mkPDF("<!DOCTYPE html><html><head><meta charset='utf-8'><style>body{font-family:Arial;margin:20px;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:5px}th{background:#f0f0f0}</style></head><body><h2>GARPI S.L. \u2014 Informe de dietas</h2><table><thead><tr><th>Fecha</th><th>Mes</th><th>Operario</th><th>Cliente</th><th>Trabajo</th><th>Dieta</th></tr></thead><tbody>"+dt.map(t=>{const[y,m]=t.fecha.split("-").map(Number);const c=gc(t.clienteId),o=gu(t.asignadoA);return"<tr><td>"+t.fecha+"</td><td>"+MONTHS[m-1]+" "+y+"</td><td>"+(o.nombre||"")+"</td><td>"+(c.nombre||"")+"</td><td>"+t.titulo+"</td><td>"+t.dieta+" \u20ac</td></tr>";}).join("")+"</tbody></table><p><b>Total: "+tot.toFixed(2)+" \u20ac</b></p></body></html>");
  };

  const renderTabCh=(secs,showTk)=>secs.map(s=>{
    const hf=s.items[0]&&typeof s.items[0]==="object";
    return(
      <Box key={s.id} title={s.titulo}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>
              {hf&&<th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,width:60,textAlign:"center"}}>Frec.(m)</th>}
              <th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"left",minWidth:160}}>Operación</th>
              <th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,width:38,textAlign:"center"}}>SI</th>
              <th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,width:38,textAlign:"center"}}>NO</th>
              <th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"left"}}>Obs.</th>
            </tr></thead>
            <tbody>
              {s.items.map((item,i)=>{
                const desc=typeof item==="object"?item.d:item,frec=typeof item==="object"?item.f:null;
                return(
                  <tr key={i}>
                    {hf&&<td style={{padding:"5px 8px",border:"0.5px solid #ddd",textAlign:"center",color:C.gray,fontSize:11}}>{frec}</td>}
                    <td style={{padding:"5px 8px",border:"0.5px solid #ddd"}}>{desc}{i===0&&showTk&&s.ticket&&<span style={{fontSize:10,color:C.primary,marginLeft:4}}>(adjuntar ticket)</span>}</td>
                    <td style={{padding:"5px 8px",border:"0.5px solid #ddd",textAlign:"center"}}><input type="checkbox" checked={!!mf.checks[s.id+"_"+i+"_si"]} onChange={e=>updCh(s.id+"_"+i+"_si",e.target.checked)}/></td>
                    <td style={{padding:"5px 8px",border:"0.5px solid #ddd",textAlign:"center"}}><input type="checkbox" checked={!!mf.checks[s.id+"_"+i+"_no"]} onChange={e=>updCh(s.id+"_"+i+"_no",e.target.checked)}/></td>
                    <td style={{padding:"4px 6px",border:"0.5px solid #ddd"}}><input value={mf.checks[s.id+"_"+i+"_obs"]||""} onChange={e=>updCh(s.id+"_"+i+"_obs",e.target.value)} style={{width:"100%",border:"none",outline:"1px solid #eee",fontSize:12,background:"#fff",borderRadius:3,padding:"2px 4px",boxSizing:"border-box"}}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showTk&&s.ticket&&(
          <div style={{marginTop:10}}>
            <label style={{fontSize:12,color:C.primary,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 10px",border:"1px dashed "+C.primary,borderRadius:6}}>
              {"📎 "+(mf.ticket?"Ticket cargado ✓":"Adjuntar ticket de combustión")}
              <input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setMf(fm=>({...fm,ticket:ev.target.result}));r.readAsDataURL(f);}}/>
            </label>
            {mf.ticket&&<img src={mf.ticket} style={{display:"block",marginTop:6,maxWidth:150,borderRadius:6,border:"0.5px solid #ddd"}} alt="ticket"/>}
          </div>
        )}
      </Box>
    );
  });

  if(!sess){
    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f5f3"}}>
        <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #ddd",padding:"32px 28px",width:320,boxSizing:"border-box"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontWeight:500,fontSize:22,color:C.navy}}>GARPI S.L.</div>
            <div style={{fontSize:12,color:C.gray,marginTop:4}}>Gestión de Partes de Trabajo</div>
          </div>
          <input placeholder="Usuario" value={lu} onChange={e=>setLu(e.target.value)} style={{...IS,marginBottom:10}}/>
          <input type="password" placeholder="Contraseña" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={{...IS,marginBottom:10}}/>
          {le&&<div style={{fontSize:12,color:C.danger,marginBottom:8}}>{le}</div>}
          <button onClick={doLogin} style={{width:"100%",padding:"10px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer"}}>Entrar</button>
          <div style={{marginTop:14,fontSize:11,color:C.gray,textAlign:"center"}}>Admin: admin/admin123 · Op: carlos/op123</div>
        </div>
      </div>
    );
  }

  const adminNav=[["dashboard","Panel"],["tareas","Tareas"],["calendario","Calendario"],["partes","Correctivos"],["partesM","Preventivos"],["fotos","Fotos"],["clientes","Clientes"],["operarios","Operarios"],["dietas","Dietas"]];
  const opNav=[["dashboard","Mi panel"],["mis_tareas","Mis tareas"],["mis_partes","Correctivos"],["mis_partesM","Preventivos"],["fotos","Mis fotos"]];
  const nav=sess.rol==="admin"?adminNav:opNav;

  const goSec=(key)=>{setSec(key);setSelT(null);setSelDay(null);setMenuOpen(false);};

  const render=()=>{
    if(sec==="dashboard"){
      const pend=myT.filter(t=>t.estado==="pendiente").length,enc=myT.filter(t=>t.estado==="en_curso").length,comp=myT.filter(t=>t.estado==="completada"||t.estado==="firmado").length;
      return(
        <div>
          <h2 style={{margin:"0 0 20px",fontWeight:500,fontSize:20}}>Panel {sess.rol==="admin"?"de administración":"del operario"}</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:24}}>
            {[[C.orangeLight,C.orange,"Pendientes",pend],[C.primaryLight,C.primary,"En curso",enc],[C.successLight,C.success,"Completadas",comp],[C.purpleLight,C.purple,"Partes",myP.length+myM.length]].map(([bg,col,lbl,val])=>(
              <div key={lbl} style={{background:bg,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:12,color:col,marginBottom:4}}>{lbl}</div><div style={{fontSize:28,fontWeight:500,color:col}}>{val}</div></div>
            ))}
          </div>
          <h3 style={{fontWeight:500,fontSize:15,margin:"0 0 10px"}}>Próximas tareas</h3>
          {myT.filter(t=>t.estado!=="completada"&&t.estado!=="firmado").slice(0,4).map(t=>(
            <div key={t.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontWeight:500,fontSize:14}}>{t.titulo}</div><div style={{fontSize:12,color:C.gray,marginTop:2}}>{gc(t.clienteId).nombre} · {t.fecha}</div><div style={{marginTop:4}}><TBdg tipo={t.tipo||"correctivo"}/></div></div>
                <EBdg estado={t.estado}/>
              </div>
            </div>
          ))}
          {offline&&<div style={{marginTop:16,padding:"10px 14px",background:C.warningLight,borderRadius:8,fontSize:13,color:C.warning}}>⚠️ Modo sin cobertura activo. Los datos se sincronizarán cuando haya conexión.</div>}
          <button onClick={()=>setOffline(v=>!v)} style={{marginTop:12,fontSize:12,padding:"6px 12px",borderRadius:6,border:"1px solid #ccc",background:"#fff",cursor:"pointer",color:C.gray}}>{offline?"🟢 Simular conexión":"🔴 Simular sin cobertura"}</button>
        </div>
      );
    }

    if(sec==="tareas"||sec==="mis_tareas"){
      const lista=sec==="mis_tareas"?myT:st.tareas;
      return(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{margin:0,fontWeight:500,fontSize:20}}>Tareas asignadas</h2>
            {sess.rol==="admin"&&<button onClick={()=>{setShowNT(true);setEditT(null);}} style={{padding:"8px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>+ Nueva tarea</button>}
          </div>
          {showNT&&sess.rol==="admin"&&(
            <div style={{background:"#fff",border:"0.5px solid #ddd",borderRadius:10,padding:16,marginBottom:16}}>
              <h3 style={{margin:"0 0 12px",fontWeight:500}}>Nueva tarea</h3>
              <div style={{marginBottom:8}}><select value={ntCli} onChange={e=>setNtCli(e.target.value)} style={IS}><option value="">Seleccionar cliente</option>{st.clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
              <div style={{marginBottom:8}}><input placeholder="Título" value={ntTit} onChange={e=>setNtTit(e.target.value)} style={IS}/></div>
              <div style={{marginBottom:8}}><input placeholder="Descripción" value={ntDes} onChange={e=>setNtDes(e.target.value)} style={IS}/></div>
              <div style={{marginBottom:8}}><select value={ntOp} onChange={e=>setNtOp(e.target.value)} style={IS}><option value="">Asignar a operario</option>{st.users.filter(u=>u.rol==="operario").map(u=><option key={u.id} value={u.id}>{u.nombre}</option>)}</select></div>
              <div style={{marginBottom:8}}><input type="date" value={ntFec} onChange={e=>setNtFec(e.target.value)} style={IS}/></div>
              <div style={{marginBottom:8}}><input placeholder="Dieta (€) — vacío si no aplica" value={ntDie} onChange={e=>setNtDie(e.target.value)} style={IS}/></div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:13,color:C.gray,marginBottom:4}}>Tipo</div>
                <label style={{fontSize:13,marginRight:16,cursor:"pointer"}}><input type="radio" checked={ntTip==="correctivo"} onChange={()=>setNtTip("correctivo")} style={{marginRight:4}}/>Correctivo</label>
                <label style={{fontSize:13,cursor:"pointer"}}><input type="radio" checked={ntTip==="preventivo"} onChange={()=>setNtTip("preventivo")} style={{marginRight:4}}/>Preventivo</label>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={crearTarea} style={{padding:"8px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>Crear tarea</button>
                <button onClick={()=>setShowNT(false)} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #ddd",background:"#fff",fontSize:13,cursor:"pointer",color:C.gray}}>Cancelar</button>
              </div>
            </div>
          )}
          {editT&&sess.rol==="admin"&&(
            <div style={{background:"#fff",border:"1.5px solid "+C.primary,borderRadius:10,padding:16,marginBottom:16}}>
              <h3 style={{margin:"0 0 12px",fontWeight:500}}>Editar tarea</h3>
              <div style={{marginBottom:8}}><select value={editT.clienteId} onChange={e=>setEditT(f=>({...f,clienteId:+e.target.value}))} style={IS}><option value="">Cliente</option>{st.clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
              <div style={{marginBottom:8}}><input placeholder="Título" value={editT.titulo} onChange={e=>setEditT(f=>({...f,titulo:e.target.value}))} style={IS}/></div>
              <div style={{marginBottom:8}}><input placeholder="Descripción" value={editT.descripcion} onChange={e=>setEditT(f=>({...f,descripcion:e.target.value}))} style={IS}/></div>
              <div style={{marginBottom:8}}><select value={editT.asignadoA} onChange={e=>setEditT(f=>({...f,asignadoA:+e.target.value}))} style={IS}><option value="">Operario</option>{st.users.filter(u=>u.rol==="operario").map(u=><option key={u.id} value={u.id}>{u.nombre}</option>)}</select></div>
              <div style={{marginBottom:8}}><input type="date" value={editT.fecha} onChange={e=>setEditT(f=>({...f,fecha:e.target.value}))} style={IS}/></div>
              <div style={{marginBottom:8}}><input placeholder="Dieta (€)" value={editT.dieta} onChange={e=>setEditT(f=>({...f,dieta:e.target.value}))} style={IS}/></div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:13,color:C.gray,marginBottom:4}}>Tipo</div>
                <label style={{fontSize:13,marginRight:16,cursor:"pointer"}}><input type="radio" name="et" checked={editT.tipo==="correctivo"} onChange={()=>setEditT(f=>({...f,tipo:"correctivo"}))} style={{marginRight:4}}/>Correctivo</label>
                <label style={{fontSize:13,cursor:"pointer"}}><input type="radio" name="et" checked={editT.tipo==="preventivo"} onChange={()=>setEditT(f=>({...f,tipo:"preventivo"}))} style={{marginRight:4}}/>Preventivo</label>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{dispatch({type:"UPD_TAREA",t:editT});setEditT(null);}} style={{padding:"8px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>Guardar</button>
                <button onClick={()=>setEditT(null)} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #ddd",background:"#fff",fontSize:13,cursor:"pointer",color:C.gray}}>Cancelar</button>
              </div>
            </div>
          )}
          {lista.map(t=>(
            <TareaCard key={t.id} t={t} showEdit={true} sess={sess} gc={gc} gu={gu} st={st}
              onEdit={t=>setEditT({...t})}
              onEliminar={id=>dispatch({type:"DEL_TAREA",id})}
              onAceptar={id=>dispatch({type:"ACEPTAR",id})}
              onCrearParte={t=>{setSelT(t.id);setSec(t.tipo==="preventivo"?"mant_form":"parte_form");}}
            />
          ))}
        </div>
      );
    }

    if(sec==="parte_form"&&selT){
      const tarea=gt(selT),cli=gc(tarea.clienteId);
      return(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <button onClick={()=>{setSec("mis_tareas");setSelT(null);}} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #ddd",background:"#fff",fontSize:13,cursor:"pointer",color:C.primary}}>← Volver</button>
            <h2 style={{margin:0,fontWeight:500,fontSize:18}}>Parte correctivo</h2>
          </div>
          <div style={{background:C.primaryLight,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13}}>
            <strong>{cli.nombre}</strong> · {tarea.fecha}<br/>
            <span style={{color:C.gray}}>{cli.direccion}</span><br/>
            <span style={{fontWeight:500}}>Trabajador: {sess.nombre}</span>
            {tarea.dieta&&<span style={{marginLeft:12,color:C.warning}}>Dieta: {tarea.dieta} €</span>}
          </div>
          <Box title="Líneas de trabajo">
            {pf.lineas.map((l,i)=>(
              <div key={i} style={{background:C.grayLight,borderRadius:8,padding:10,marginBottom:10}}>
                <div style={{fontSize:12,color:C.gray,marginBottom:6}}>Línea {i+1}</div>
                <textarea placeholder="Trabajos realizados" value={l.trab} onChange={e=>updL(i,"trab",e.target.value)} style={{...IS,height:56,resize:"vertical",marginBottom:6}}/>
                <input placeholder="Materiales utilizados" value={l.mat} onChange={e=>updL(i,"mat",e.target.value)} style={IS}/>
              </div>
            ))}
            <button onClick={addL} style={{fontSize:12,padding:"6px 12px",borderRadius:6,border:"1px dashed #aaa",background:"#fff",cursor:"pointer",color:C.gray}}>+ Añadir línea</button>
          </Box>
          <Box title="Pie del parte">
            <textarea placeholder="Observaciones" value={pf.obs} onChange={e=>setPf(f=>({...f,obs:e.target.value}))} style={{...IS,height:60,resize:"vertical",marginBottom:8}}/>
            <input placeholder="Horas trabajadas" value={pf.hrs} onChange={e=>setPf(f=>({...f,hrs:e.target.value}))} style={IS}/>
          </Box>
          <Box title="Firmas">
            <SigPad label="Firma del cliente" onSave={d=>setPf(f=>({...f,fCli:d}))}/>
            <SigPad label="Firma del trabajador / empresa" onSave={d=>setPf(f=>({...f,fTrab:d}))}/>
          </Box>
          <button onClick={()=>subC(selT)} style={{width:"100%",padding:"12px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",marginTop:8}}>Guardar parte correctivo</button>
        </div>
      );
    }

    if(sec==="mant_form"&&selT){
      const tarea=gt(selT);const cliObj=mf.clienteId?gc(mf.clienteId):gc(tarea.clienteId);
      return(
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <button onClick={()=>{setSec("mis_tareas");setSelT(null);}} style={{padding:"6px 14px",borderRadius:6,border:"1px solid #ddd",background:"#fff",fontSize:13,cursor:"pointer",color:C.primary}}>← Volver</button>
            <h2 style={{margin:0,fontWeight:500,fontSize:18}}>Ficha de Mantenimiento</h2>
          </div>
          <Box title="Cabecera">
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,color:C.gray,marginBottom:6}}>Tipo de mantenimiento preventivo</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[["calderas","🔥 Calderas"],["grupos","💧 Grupos Presión"],["legionella","🧪 Legionella"],["otros","📋 Otros"]].map(([val,lbl])=>(
                  <button key={val} onClick={()=>chgTipo(val)} style={{padding:"7px 12px",borderRadius:8,border:"1.5px solid "+(mf.tipoMant===val?C.primary:"#ddd"),background:mf.tipoMant===val?C.primaryLight:"#fff",color:mf.tipoMant===val?C.primary:C.gray,fontSize:13,cursor:"pointer",fontWeight:mf.tipoMant===val?500:400}}>{lbl}</button>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.gray}}>Instalación (cliente)</label><select value={mf.clienteId} onChange={e=>setMf(f=>({...f,clienteId:+e.target.value,emplazamiento:""}))} style={{...IS,marginTop:2}}><option value="">Seleccionar cliente</option>{st.clientes.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
              <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:C.gray}}>Emplazamiento</label><select value={mf.emplazamiento} onChange={e=>setMf(f=>({...f,emplazamiento:e.target.value}))} style={{...IS,marginTop:2}}><option value="">Seleccionar emplazamiento</option>{(cliObj.emps||[]).map((e,i)=><option key={i} value={e}>{e}</option>)}</select></div>
              <div><label style={{fontSize:12,color:C.gray}}>Población</label><input value={mf.poblacion} onChange={e=>setMf(f=>({...f,poblacion:e.target.value}))} style={{...IS,marginTop:2}}/></div>
              <div><label style={{fontSize:12,color:C.gray}}>Provincia</label><input value={mf.provincia} onChange={e=>setMf(f=>({...f,provincia:e.target.value}))} style={{...IS,marginTop:2}}/></div>
              <div><label style={{fontSize:12,color:C.gray}}>Fecha</label><input type="date" value={mf.fecha} onChange={e=>setMf(f=>({...f,fecha:e.target.value}))} style={{...IS,marginTop:2}}/></div>
            </div>
          </Box>
          {mf.tipoMant==="calderas"&&(
            <div>
              {renderTabCh(SC,true)}
              <Box title="PARÁMETROS OPERATIVOS">
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"left"}}>Parámetro</th><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"center"}}>Control Planta (°C)</th><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"center"}}>Real Equipos (°C)</th></tr></thead>
                  <tbody>{[["Temp. acumulación ACS","tAC","tAR"],["Temp. impulsión primario","tIC","tIR"],["Temp. retorno ACS","tRC","tRR"]].map(([lbl,k1,k2])=>(
                    <tr key={lbl}><td style={{padding:"5px 8px",border:"0.5px solid #ddd"}}>{lbl}</td><td style={{padding:"4px 6px",border:"0.5px solid #ddd"}}><input value={mf[k1]} onChange={e=>setMf(f=>({...f,[k1]:e.target.value}))} style={{width:"100%",border:"none",outline:"none",fontSize:13,textAlign:"center",background:"transparent"}}/></td><td style={{padding:"4px 6px",border:"0.5px solid #ddd"}}><input value={mf[k2]} onChange={e=>setMf(f=>({...f,[k2]:e.target.value}))} style={{width:"100%",border:"none",outline:"none",fontSize:13,textAlign:"center",background:"transparent"}}/></td></tr>
                  ))}</tbody>
                </table>
              </Box>
              <Box title="LECTURAS CONSUMO Y CORRECTORES">
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,marginBottom:10}}>
                  <thead><tr><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight}}>Concepto</th><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"center"}}>Contador 1 (m³)</th><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"center"}}>Contador 2 (m³)</th></tr></thead>
                  <tbody>{[["Contador gas","g1","g2"],["Libre 1","l1a","l1b"],["Libre 2","l2a","l2b"]].map(([lbl,k1,k2])=>(
                    <tr key={lbl}><td style={{padding:"5px 8px",border:"0.5px solid #ddd"}}>{lbl}</td><td style={{padding:"4px 6px",border:"0.5px solid #ddd"}}><input value={mf[k1]} onChange={e=>setMf(f=>({...f,[k1]:e.target.value}))} style={{width:"100%",border:"none",outline:"none",fontSize:13,textAlign:"center",background:"transparent"}}/></td><td style={{padding:"4px 6px",border:"0.5px solid #ddd"}}><input value={mf[k2]} onChange={e=>setMf(f=>({...f,[k2]:e.target.value}))} style={{width:"100%",border:"none",outline:"none",fontSize:13,textAlign:"center",background:"transparent"}}/></td></tr>
                  ))}</tbody>
                </table>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight}}>Corrector</th><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"center"}}>Corrector 1 (MWh)</th><th style={{padding:"5px 8px",border:"0.5px solid #ddd",background:C.grayLight,textAlign:"center"}}>Corrector 2 (MWh)</th></tr></thead>
                  <tbody>{[["Energía 1","c1a","c1b"],["Energía 2","c2a","c2b"]].map(([lbl,k1,k2])=>(
                    <tr key={lbl}><td style={{padding:"5px 8px",border:"0.5px solid #ddd"}}>{lbl}</td><td style={{padding:"4px 6px",border:"0.5px solid #ddd"}}><input value={mf[k1]} onChange={e=>setMf(f=>({...f,[k1]:e.target.value}))} style={{width:"100%",border:"none",outline:"none",fontSize:13,textAlign:"center",background:"transparent"}}/></td><td style={{padding:"4px 6px",border:"0.5px solid #ddd"}}><input value={mf[k2]} onChange={e=>setMf(f=>({...f,[k2]:e.target.value}))} style={{width:"100%",border:"none",outline:"none",fontSize:13,textAlign:"center",background:"transparent"}}/></td></tr>
                  ))}</tbody>
                </table>
              </Box>
            </div>
          )}
          {mf.tipoMant==="grupos"&&renderTabCh(SG,false)}
          {mf.tipoMant==="legionella"&&renderTabCh(SL,false)}
          {mf.tipoMant==="otros"&&(
            <Box title="DESCRIPCIÓN DEL MANTENIMIENTO">
              <div style={{marginBottom:8}}><label style={{fontSize:12,color:C.gray,display:"block",marginBottom:4}}>Tipo / título del trabajo</label><input value={mf.otrosDesc} onChange={e=>setMf(f=>({...f,otrosDesc:e.target.value}))} placeholder="Ej: Mantenimiento climatización..." style={IS}/></div>
              <div><label style={{fontSize:12,color:C.gray,display:"block",marginBottom:4}}>Operaciones realizadas</label><textarea value={mf.otrosReal} onChange={e=>setMf(f=>({...f,otrosReal:e.target.value}))} placeholder="Describe las operaciones..." style={{...IS,height:140,resize:"vertical"}}/></div>
            </Box>
          )}
          <Box title="Firmas">
            <SigPad label="Firma del cliente" onSave={d=>setMf(f=>({...f,firmaTec:d}))}/>
            <SigPad label="Firma del operario-mantenedor" onSave={d=>setMf(f=>({...f,firmaOp:d}))}/>
          </Box>
          <button onClick={()=>subM(selT)} style={{width:"100%",padding:"12px",borderRadius:8,border:"none",background:C.purple,color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer",marginTop:8}}>Guardar ficha de mantenimiento</button>
        </div>
      );
    }

    if(sec==="calendario"){
      const fd=new Date(calY,calM,1).getDay(),dim=new Date(calY,calM+1,0).getDate(),off=fd===0?6:fd-1;
      const days=[];for(let i=0;i<off;i++)days.push(null);for(let i=1;i<=dim;i++)days.push(i);
      const today=new Date();
      const dT=day=>{if(!day)return[];const ds=calY+"-"+String(calM+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");return st.tareas.filter(t=>t.fecha===ds);};
      const pM=()=>{if(calM===0){setCalM(11);setCalY(y=>y-1);}else setCalM(m=>m-1);setSelDay(null);};
      const nM=()=>{if(calM===11){setCalM(0);setCalY(y=>y+1);}else setCalM(m=>m+1);setSelDay(null);};
      return(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
            <h2 style={{margin:0,fontWeight:500,fontSize:20}}>Calendario</h2>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <button onClick={pM} style={{padding:"5px 10px",borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer"}}>◀</button>
              <span style={{fontWeight:500,fontSize:14,minWidth:130,textAlign:"center"}}>{MONTHS[calM]} {calY}</span>
              <button onClick={nM} style={{padding:"5px 10px",borderRadius:6,border:"1px solid #ddd",background:"#fff",cursor:"pointer"}}>▶</button>
              <select value={calY} onChange={e=>{setCalY(+e.target.value);setSelDay(null);}} style={{padding:"5px 8px",borderRadius:6,border:"1px solid #ddd",fontSize:13}}>{[2024,2025,2026,2027,2028].map(y=><option key={y} value={y}>{y}</option>)}</select>
              <button onClick={pdfMensual} style={{padding:"5px 10px",borderRadius:6,border:"none",background:C.primary,color:"#fff",fontSize:12,cursor:"pointer"}}>PDF</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>{WDAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:C.gray,fontWeight:500,padding:"4px 0"}}>{d}</div>)}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
            {days.map((day,i)=>{
              if(!day)return <div key={i}/>;
              const dt=dT(day),isToday=day===today.getDate()&&calM===today.getMonth()&&calY===today.getFullYear(),isSel=day===selDay;
              return(
                <div key={i} onClick={()=>setSelDay(day===selDay?null:day)} style={{minHeight:52,padding:4,borderRadius:6,border:isSel?"2px solid "+C.primary:"0.5px solid "+(isToday?C.primary:"#e0e0e0"),background:isSel?C.primaryLight:isToday?"#f0f6ff":"#fff",cursor:"pointer"}}>
                  <div style={{fontSize:12,fontWeight:isToday?500:400,color:isToday?C.primary:"inherit"}}>{day}</div>
                  {dt.slice(0,2).map(t=>{const isP=t.tipo==="preventivo",done=t.estado==="completada"||t.estado==="firmado",bg=done?(isP?C.purpleLight:C.successLight):t.estado==="en_curso"?C.primaryLight:C.orangeLight,col=done?(isP?C.purple:C.success):t.estado==="en_curso"?C.primary:C.orange;return <div key={t.id} style={{fontSize:9,background:bg,color:col,borderRadius:3,padding:"1px 3px",marginTop:2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.titulo}</div>;})}
                  {dt.length>2&&<div style={{fontSize:9,color:C.gray}}>+{dt.length-2}</div>}
                </div>
              );
            })}
          </div>
          {selDay&&(
            <div style={{marginTop:16,background:"#fff",border:"0.5px solid #ddd",borderRadius:10,padding:16}}>
              <h3 style={{margin:"0 0 12px",fontWeight:500,fontSize:15}}>{selDay} de {MONTHS[calM]} {calY} — {dT(selDay).length} actuación(es)</h3>
              {dT(selDay).length===0?<div style={{fontSize:13,color:C.gray}}>Sin tareas.</div>:dT(selDay).map(t=>{
                const cli=gc(t.clienteId),op=gu(t.asignadoA),parte=st.partes.find(p=>p.tareaId===t.id),partM=st.partesM.find(p=>p.tareaId===t.id);
                return(
                  <div key={t.id} style={{background:C.grayLight,borderRadius:8,padding:"10px 12px",marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontWeight:500,fontSize:14}}>{t.titulo}</div>
                        <div style={{marginTop:4,display:"flex",gap:6}}><EBdg estado={t.estado}/><TBdg tipo={t.tipo||"correctivo"}/></div>
                        <div style={{fontSize:12,color:C.gray,marginTop:4}}>Cliente: {cli.nombre} · Operario: {op.nombre}</div>
                        {t.dieta&&<div style={{fontSize:12,color:C.warning}}>Dieta: {t.dieta} €</div>}
                        {parte&&<div style={{fontSize:12,color:C.gray}}>Horas: {parte.horas}h · Obs: {parte.observaciones}</div>}
                        {partM&&<div style={{fontSize:12,color:C.purple,marginTop:4}}>Ficha preventivo — Emplazamiento: {partM.emplazamiento}</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {parte&&sess.rol==="admin"&&<button onClick={()=>pdfC(parte)} style={{padding:"5px 10px",borderRadius:7,border:"none",background:C.danger,color:"#fff",fontSize:11,cursor:"pointer"}}>PDF correctivo</button>}
                        {partM&&sess.rol==="admin"&&<button onClick={()=>pdfM(partM)} style={{padding:"5px 10px",borderRadius:7,border:"none",background:C.purple,color:"#fff",fontSize:11,cursor:"pointer"}}>PDF preventivo</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if(sec==="partes"||sec==="mis_partes"){
      return(
        <div>
          <h2 style={{margin:"0 0 16px",fontWeight:500,fontSize:20}}>Partes correctivos</h2>
          {myP.length===0&&<div style={{fontSize:14,color:C.gray}}>No hay partes correctivos aún.</div>}
          {myP.map(p=>{const cli=gc(p.clienteId),op=gu(p.operarioId),tarea=gt(p.tareaId);return(
            <div key={p.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:14,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontWeight:500,fontSize:14}}>Parte #{p.id} — {p.obra}</div><div style={{fontSize:12,color:C.gray,marginTop:2}}>{p.fecha} · {op.nombre}</div>{tarea.dieta&&<div style={{fontSize:12,color:C.warning}}>Dieta: {tarea.dieta} €</div>}<div style={{marginTop:6}}><EBdg estado={p.estado}/></div></div>
                {sess.rol==="admin"&&<button onClick={()=>pdfC(p)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:C.danger,color:"#fff",fontSize:12,cursor:"pointer"}}>PDF</button>}
              </div>
            </div>
          );})}
        </div>
      );
    }

    if(sec==="partesM"||sec==="mis_partesM"){
      return(
        <div>
          <h2 style={{margin:"0 0 16px",fontWeight:500,fontSize:20}}>Fichas preventivas</h2>
          {myM.length===0&&<div style={{fontSize:14,color:C.gray}}>No hay fichas preventivas aún.</div>}
          {myM.map(p=>{const cli=gc(p.clienteId),op=gu(p.operarioId);return(
            <div key={p.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:14,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div><div style={{fontWeight:500,fontSize:14}}>Ficha #{p.id} — {cli.nombre}</div><div style={{fontSize:12,color:C.gray,marginTop:2}}>{p.fecha} · {op.nombre}</div><div style={{fontSize:12,color:C.gray}}>Emplazamiento: {p.emplazamiento}</div><div style={{marginTop:6,display:"flex",gap:6}}><EBdg estado={p.estado}/><TBdg tipo="preventivo"/></div></div>
                {sess.rol==="admin"&&<button onClick={()=>pdfM(p)} style={{padding:"7px 14px",borderRadius:8,border:"none",background:C.purple,color:"#fff",fontSize:12,cursor:"pointer"}}>PDF</button>}
              </div>
            </div>
          );})}
        </div>
      );
    }

    if(sec==="fotos"){
      const allP=[...st.partes,...st.partesM].filter(p=>sess.rol==="admin"||p.operarioId===sess.id);
      const subFoto=(pid,isM,file)=>{if(!file)return;const r=new FileReader();r.onload=ev=>{const f={name:file.name,data:ev.target.result,fecha:new Date().toISOString().split("T")[0]};dispatch(isM?{type:"ADD_FOTO_M",pid,f}:{type:"ADD_FOTO",pid,f});};r.readAsDataURL(file);};
      return(
        <div>
          <h2 style={{margin:"0 0 12px",fontWeight:500,fontSize:20}}>Gestión de fotos</h2>
          <div style={{fontSize:13,color:C.gray,marginBottom:16}}>{sess.rol==="admin"?"Descarga disponible para admin.":"Sube las fotos del trabajo."}</div>
          {allP.length===0&&<div style={{fontSize:13,color:C.gray}}>No hay partes aún.</div>}
          {allP.map(p=>{const cli=gc(p.clienteId),fotos=p.fotos||[],isM=p.tipo==="preventivo";return(
            <div key={p.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:14,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div style={{fontWeight:500,fontSize:14}}>{cli.nombre} — {p.fecha}</div><TBdg tipo={p.tipo||"correctivo"}/></div>
              <div style={{fontSize:12,color:C.gray,marginBottom:8}}>{isM?"Ficha preventiva":"Parte correctivo"} #{p.id} · {fotos.length} foto(s)</div>
              <label style={{display:"inline-block",padding:"6px 12px",borderRadius:7,border:"1px dashed #aaa",fontSize:12,cursor:"pointer",marginBottom:8,color:C.gray}}>
                + Subir foto(s)
                <input type="file" accept="image/*" capture="environment" multiple style={{display:"none"}} onChange={e=>{Array.from(e.target.files).forEach(f=>subFoto(p.id,isM,f));e.target.value="";}}/>
              </label>
              {fotos.length===0?<div style={{fontSize:12,color:C.gray}}>Sin fotos</div>:(
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {fotos.map((f,i)=>(
                    <div key={i} style={{position:"relative"}}>
                      <img src={f.data} style={{width:80,height:80,objectFit:"cover",borderRadius:6,border:"0.5px solid #ddd"}} alt={f.name}/>
                      {sess.rol==="admin"&&<a href={f.data} download={f.name} style={{position:"absolute",bottom:2,right:2,background:C.primary,color:"#fff",borderRadius:4,padding:"1px 5px",fontSize:10,textDecoration:"none"}}>↓</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );})}
        </div>
      );
    }

    if(sec==="clientes") return <Clientes st={st} dispatch={dispatch}/>;

    if(sec==="operarios"){
      const ops=st.users.filter(u=>u.rol==="operario");
      return(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h2 style={{margin:0,fontWeight:500,fontSize:20}}>Operarios ({ops.length})</h2>
            <button onClick={()=>{setShowNO(true);setEditOp(null);}} style={{padding:"8px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>+ Añadir operario</button>
          </div>
          {showNO&&(
            <div style={{background:"#fff",border:"0.5px solid #ddd",borderRadius:10,padding:16,marginBottom:16}}>
              <h3 style={{margin:"0 0 10px",fontWeight:500}}>Nuevo operario</h3>
              <div style={{marginBottom:8}}><input placeholder="Nombre completo" value={no.nombre} onChange={e=>setNo(f=>({...f,nombre:e.target.value}))} style={IS}/></div>
              <div style={{marginBottom:8}}><input placeholder="Usuario (login)" value={no.usuario} onChange={e=>setNo(f=>({...f,usuario:e.target.value}))} style={IS}/></div>
              <div style={{marginBottom:8}}><input placeholder="Contraseña inicial" value={no.password} onChange={e=>setNo(f=>({...f,password:e.target.value}))} style={IS}/></div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{if(!no.nombre||!no.usuario||!no.password)return;dispatch({type:"ADD_USER",u:{...no,id:Date.now(),rol:"operario"}});setShowNO(false);setNo({nombre:"",usuario:"",password:""});}} style={{padding:"7px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>Crear</button>
                <button onClick={()=>setShowNO(false)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #ddd",background:"#fff",fontSize:13,cursor:"pointer",color:C.gray}}>Cancelar</button>
              </div>
            </div>
          )}
          {editOp&&(
            <div style={{background:"#fff",border:"1.5px solid "+C.primary,borderRadius:10,padding:16,marginBottom:16}}>
              <h3 style={{margin:"0 0 10px",fontWeight:500}}>Editar operario</h3>
              <div style={{marginBottom:8}}><input placeholder="Nombre" value={editOp.nombre} onChange={e=>setEditOp(f=>({...f,nombre:e.target.value}))} style={IS}/></div>
              <div style={{marginBottom:8}}><input placeholder="Usuario" value={editOp.usuario} onChange={e=>setEditOp(f=>({...f,usuario:e.target.value}))} style={IS}/></div>
              <div style={{marginBottom:8}}><input placeholder="Nueva contraseña" value={editOp.password} onChange={e=>setEditOp(f=>({...f,password:e.target.value}))} style={IS}/></div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{if(!editOp.nombre||!editOp.usuario)return;dispatch({type:"UPD_USER",u:editOp});setEditOp(null);}} style={{padding:"7px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",fontSize:13,cursor:"pointer"}}>Guardar</button>
                <button onClick={()=>setEditOp(null)} style={{padding:"7px 14px",borderRadius:8,border:"1px solid #ddd",background:"#fff",fontSize:13,cursor:"pointer",color:C.gray}}>Cancelar</button>
              </div>
            </div>
          )}
          {ops.map(u=>(
            <div key={u.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:500,fontSize:14}}>{u.nombre}</div><div style={{fontSize:12,color:C.gray}}>Usuario: {u.usuario}</div><div style={{fontSize:12,color:C.primary,marginTop:2}}>{st.tareas.filter(t=>t.asignadoA===u.id).length} tarea(s)</div></div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>{setEditOp({id:u.id,nombre:u.nombre,usuario:u.usuario,password:""});setShowNO(false);}} style={{padding:"5px 10px",borderRadius:7,border:"1px solid "+C.primary,background:"#fff",color:C.primary,fontSize:12,cursor:"pointer"}}>Editar</button>
                <button onClick={()=>dispatch({type:"DEL_USER",id:u.id})} style={{padding:"5px 10px",borderRadius:7,border:"none",background:C.dangerLight,color:C.danger,fontSize:12,cursor:"pointer"}}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if(sec==="dietas") return <Dietas st={st} gc={gc} gu={gu} pdfFn={pdfDietas}/>;
    return null;
  };

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f5f5f3",fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:172,background:C.navy,minHeight:"100vh",padding:"16px 0",flexShrink:0,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
        <div style={{padding:"0 14px 16px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontWeight:500,color:"#fff",fontSize:16}}>GARPI S.L.</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2}}>{sess.nombre}</div>
          <span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:"rgba(255,255,255,0.1)",color:"#B5D4F4",marginTop:4,display:"inline-block"}}>{sess.rol==="admin"?"Administrador":"Operario"}</span>
        </div>
        {nav.map(([key,label])=>(
          <div key={key} onClick={()=>goSec(key)} style={{padding:"10px 14px",cursor:"pointer",fontSize:13,color:sec===key?"#fff":"rgba(255,255,255,0.55)",background:sec===key?"rgba(255,255,255,0.12)":"transparent",borderLeft:sec===key?"3px solid #378ADD":"3px solid transparent"}}>{label}</div>
        ))}
        <div onClick={doLogout} style={{padding:"10px 14px",cursor:"pointer",fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:16}}>Cerrar sesión</div>
      </div>
      <div style={{flex:1,padding:"24px 28px",overflowY:"auto",maxWidth:760,boxSizing:"border-box"}}>{render()}</div>
    </div>
  );
}