import { useState, useRef, useEffect, useReducer } from "react";
import { supabase } from "./supabase";

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

const SS = [
  {id:"sol_cap",titulo:"SISTEMA DE CAPTACIÓN",items:[{d:"Limpieza de superficie con agua y productos adecuados",f:"Según estado"},{d:"Cristales: condensaciones en horas centrales y suciedad",f:"3"},{d:"Juntas: agrietamientos, deformaciones",f:"3"},{d:"Absorbedor: corrosión, deformaciones",f:"3"},{d:"Carcasa: deformación, oscilaciones, ventanas de aireación",f:"3"},{d:"Conexiones: aparición de fugas",f:"3"},{d:"Estructura: degradación, indicios de corrosión, apriete de tornillos",f:"3"}]},
  {id:"sol_acu",titulo:"SISTEMA DE ACUMULACIÓN",items:[{d:"Depósito: presencia de lodos en fondo",f:"12"},{d:"Ánodos sacrificio: comprobación del desgaste",f:"12"},{d:"Ánodos de corriente impresa: comprobación del buen funcionamiento",f:"12"},{d:"Aislamiento: comprobar que no hay humedad",f:"12"}]},
  {id:"sol_int",titulo:"SISTEMA DE INTERCAMBIO",items:[{d:"Intercambiador de placas: control de funcionamiento, eficiencia y limpieza",f:"12"},{d:"Intercambiador de serpentín: control de funcionamiento, eficiencia y limpieza",f:"12"}]},
  {id:"sol_hid",titulo:"CIRCUITO HIDRÁULICO",items:[{d:"Fluido refrigerante: comprobar densidad y pH",f:"12"},{d:"Estanqueidad del sistema: efectuar prueba de presión",f:"12"},{d:"Tuberías: comprobación de presiones en los circuitos",f:"12"},{d:"Aislamiento al exterior: degradación, protección uniones y ausencia de humedad",f:"12"},{d:"Aislamiento al interior: uniones y ausencia de humedad",f:"12"},{d:"Purgador automático: control de funcionamiento y limpieza",f:"12"},{d:"Purgador manual: vaciar el aire del botellín",f:"12"},{d:"Bomba: estanqueidad, anomalías de funcionamiento, comprobación de consumos",f:"12"},{d:"Vaso de expansión cerrado: comprobación de la presión",f:"12"},{d:"Vaso de expansión abierto: comprobación del nivel",f:"12"},{d:"Sistema de llenado: control de funcionamiento actuación",f:"12"},{d:"Válvula de corte: control actuaciones (abrir y cerrar) para evitar agarrotamiento",f:"12"},{d:"Válvula de seguridad: control de funcionamiento actuación",f:"12"}]},
  {id:"sol_ele",titulo:"SISTEMA ELÉCTRICO Y CONTROL",items:[{d:"Cuadro eléctrico: comprobar que está siempre bien cerrado para que no entre polvo",f:"12"},{d:"Control diferencial: control de funcionamiento actuación",f:"12"},{d:"Termostato: control de funcionamiento actuación",f:"12"},{d:"Verificación del sistema de medida: control de funcionamiento actuación",f:"12"}]},
  {id:"sol_aux",titulo:"SISTEMA DE ENERGÍA AUXILIAR",items:[{d:"Sistema auxiliar: control de funcionamiento actuación",f:"12"}]}
];

function initCh(secs) {
  const ch = {};
  if (!secs) return ch;
  secs.forEach(s => {
    if (s.items) {
      s.items.forEach((_, i) => {
        ch[s.id + "_" + i + "_si"] = false;
        ch[s.id + "_" + i + "_no"] = false;
        ch[s.id + "_" + i + "_obs"] = "";
      });
    }
  });
  return ch;
}

function initMF() {
  return {
    clienteid: "", emplazamiento: "", poblacion: "", provincia: "", fecha: "", tipoMant: "calderas",
    checks: initCh(SC), otrosDesc: "", otrosReal: "",
    tAC: "", tAR: "", tIC: "", tIR: "", tRC: "", tRR: "",
    g1: "", g2: "", l1a: "", l1b: "", l2a: "", l2b: "", c1a: "", c1b: "", c2a: "", c2b: "",
    firmaTec: null, firmaOp: null, ticket: null
  };
}

function SigPad({label,onSave}){
  const ref=useRef(null);const dr=useRef(false);const[signed,setSigned]=useState(false);const[saved,setSaved]=useState(false);
  useEffect(()=>{const c=ref.current,x=c.getContext("2d");c.width=c.offsetWidth||300;x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.strokeStyle="#111";x.lineWidth=2.5;x.lineCap="round";x.lineJoin="round";},[]);
  const gp=(e,c)=>{const r=c.getBoundingClientRect(),src=e.touches?e.touches[0]:e;return{x:(src.clientX-r.left)*(c.width/r.width),y:(src.clientY-r.top)*(c.height/r.height)};};
  const ds=e=>{e.preventDefault();dr.current=true;const c=ref.current,x=c.getContext("2d"),p=gp(e,c);x.beginPath();x.moveTo(p.x,p.y);setSaved(false);};
  const dm=e=>{e.preventDefault();if(!dr.current)return;const c=ref.current,x=c.getContext("2d"),p=gp(e,c);x.lineTo(p.x,p.y);x.stroke();setSigned(true);};
  const de=e=>{e.preventDefault();dr.current=false;};
  const clr=()=>{const c=ref.current,x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);setSigned(false);setSaved(false);};
  const save=()=>{onSave(ref.current.toDataURL());setSaved(true);};
  return(
    <div style={{margin:"12px 0"}}>
      <p style={{fontSize:13,color:C.gray,margin:"0 0 6px",fontWeight:500}}>{label}</p>
      <canvas ref={ref} width={300} height={110} style={{border:"2px solid "+(signed?C.primary:"#ccc"),borderRadius:10,touchAction:"none",cursor:"crosshair",display:"block",width:"100%",maxWidth:400,background:"#fff",boxSizing:"border-box"}} onMouseDown={ds} onMouseMove={dm} onMouseUp={de} onMouseLeave={de} onTouchStart={ds} onTouchMove={dm} onTouchEnd={de}/>
      <div style={{display:"flex",gap:8,marginTop:8,alignItems:"center"}}>
        <button onClick={clr} style={{fontSize:13,padding:"6px 14px",borderRadius:8,border:"1px solid #ccc",background:"#fff",cursor:"pointer",color:C.gray}>Borrar</button>
        {signed&&!saved&&<button onClick={save} style={{fontSize:13,padding:"6px 14px",borderRadius:8,border:"none",background:C.primary,color:"#fff",cursor:"pointer",fontWeight:500}}>Guardar firma</button>}
        {saved&&<span style={{fontSize:13,color:C.success,fontWeight:500}}>✓ Guardada</span>}
      </div>
    </div>
  );
}

function Bdg({text,color,bg}){return <span style={{fontSize:11,padding:"2px 8px",borderRadius:12,background:bg,color,fontWeight:500}}>{text}</span>;}
function EBdg({estado}){const m={pendiente:[C.orange,C.orangeLight,"Pendiente"],en_curso:[C.primary,C.primaryLight,"En curso"],completada:[C.success,C.successLight,"Completada"],firmado:[C.success,C.successLight,"Firmado"]};const[col,bg,txt]=m[estado]||[C.gray,C.grayLight,"—"];return <Bdg text={txt} color={col} bg={bg}/>;}
function TBdg({tipo}){return tipo==="preventivo"?<Bdg text="Preventivo" color={C.purple} bg={C.purpleLight}/>:<Bdg text="Correctivo" color={C.primary} bg={C.primaryLight}/>;}
function Box({title,children}){return <div style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:16,marginBottom:12}}><h3 style={{margin:"0 0 10px",fontWeight:500,fontSize:14,color:C.navy}}>{title}</h3>{children}</div>;}

function TareaCard({t,showEdit,sess,gc,gu,st,onEdit,onEliminar,onAceptar,onCrearParte}){
  const cli=gc(t.clienteid),op=gu(t.asignadoa);
  const pe=st.partes.find(p=>p.tareaid===t.id)||st.partesM.find(p=>p.tareaid===t.id);
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
            <EBdg estado={t.estado}/><TBdg tipo={t.tipo||"correctivo"}/>
            {t.aceptada?<Bdg text="Aceptada" color={C.success} bg={C.successLight}/>:<Bdg text="Sin aceptar" color={C.gray} bg={C.grayLight}/>}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
          {showEdit&&sess.rol==="admin"&&<button onClick={()=>onEdit(t)} style={{padding:"5px 10px",borderRadius:7,border:"1px solid "+C.primary,background:"#fff",color:C.primary,fontSize:12,cursor:"pointer"}}>Editar</button>}
          {showEdit&&sess.rol==="admin"&&<button onClick={()=>onEliminar(t.id)} style={{padding:"5px 10px",borderRadius:7,border:"none",background:C.dangerLight,color:C.danger,fontSize:12,cursor:"pointer"}}>Eliminar</button>}
          {sess.rol==="operario"&&!t.aceptada&&t.asignadoa===sess.id&&<button onClick={()=>onAceptar(t.id)} style={{padding:"6px 12px",borderRadius:7,border:"none",background:C.success,color:"#fff",fontSize:12,cursor:"pointer"}}>Aceptar</button>}
          {sess.rol==="operario"&&t.aceptada&&!pe&&t.asignadoa===sess.id&&<button onClick={()=>onCrearParte(t)} style={{padding:"6px 12px",borderRadius:7,border:"none",background:C.primary,color:"#fff",fontSize:12,cursor:"pointer"}}>Crear parte</button>}
          {pe&&<Bdg text="Parte creado" color={C.success} bg={C.successLight}/>}
        </div>
      </div>
    </div>
  );
}

function Clientes({clientes,dispatch2}){
  const[show,setShow]=useState(false);const[edit,setEdit]=useState(null);
  const[nom,setNom]=useState("");const[dir,setDir]=useState("");const[emps,setEmps]=useState("");
  const guardar=async()=>{if(!nom.trim())return;const{data}=await supabase.from("clientes").insert({nombre:nom.trim(),direccion:dir.trim(),emps:emps.split(",").map(x=>x.trim()).filter(Boolean)}).select().single();if(data)dispatch2({type:"ADD_CLI",c:data});setNom("");setDir("");setEmps("");setShow(false);};
  const guardarEdit=async()=>{if(!edit||!edit.nombre.trim())return;const{data}=await supabase.from("clientes").update({nombre:edit.nombre.trim(),direccion:(edit.dir||"").trim(),emps:(edit.emps||"").split(",").map(x=>x.trim()).filter(Boolean)}).eq("id",edit.id).select().single();if(data)dispatch2({type:"UPD_CLI",c:data});setEdit(null);};
  const eliminar=async(id)=>{await supabase.from("clientes").delete().eq("id",id);dispatch2({type:"DEL_CLI",id});};
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
      {clientes.map(c=>(
        <div key={c.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:10,padding:"12px 14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:500,fontSize:14}}>{c.nombre}</div>
              <div style={{fontSize:12,color:C.gray}}>{c.direccion}</div>
              {c.emps&&c.emps.length>0&&<div style={{fontSize:12,color:C.primary,marginTop:2}}>Emplazamientos: {c.emps.join(" · ")}</div>}
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>{setEdit({id:c.id,nombre:c.nombre,dir:c.direccion,emps:(c.emps||[]).join(", ")});setShow(false);}} style={{padding:"5px 10px",borderRadius:7,border:"1px solid "+C.primary,background:"#fff",color:C.primary,fontSize:12,cursor:"pointer"}}>Editar</button>
              <button onClick={()=>eliminar(c.id)} style={{padding:"5px 10px",borderRadius:7,border:"none",background:C.dangerLight,color:C.danger,fontSize:12,cursor:"pointer"}}>Eliminar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Dietas({tareas,clientes,usuarios,pdfFn}){
  const[fM,setFM]=useState(-1);const[fA,setFA]=useState(-1);
  const gc=id=>clientes.find(c=>c.id===id)||{};
  const gu=id=>usuarios.find(u=>u.id===id)||{};
  const all=tareas.filter(t=>t.dieta&&parseFloat(t.dieta)>0);
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
        <select value={fA} onChange={e=>setFA(+e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #ddd",fontSize:13}}><option value={-1}>Todos los años</option>{[2024,2025,2026,2027,2028,2029,2030].map(y=><option key={y} value={y}>{y}</option>)}</select>
        <select value={fM} onChange={e=>setFM(+e.target.value)} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #ddd",fontSize:13}}><option value={-1}>Todos los meses</option>{MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}</select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:20}}>
        <div style={{background:C.warningLight,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:12,color:C.warning,marginBottom:4}}>Total dietas</div><div style={{fontSize:26,fontWeight:500,color:C.warning}}>{tot.toFixed(2)} €</div></div>
        <div style={{background:C.primaryLight,borderRadius:10,padding:"14px 16px"}}><div style={{fontSize:12,color:C.primary,marginBottom:4}}>Con dieta</div><div style={{fontSize:26,fontWeight:500,color:C.primary}}>{dt.length}</div></div>
      </div>
      {Object.keys(pm).length>0&&<div style={{marginBottom:16}}><h3 style={{fontWeight:500,fontSize:15,margin:"0 0 10px"}}>Por mes</h3>{Object.entries(pm).map(([mes,v])=><div key={mes} style={{display:"flex",justifyContent:"space-between",background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:8,padding:"10px 14px",marginBottom:6}}><span>{mes}</span><span style={{fontWeight:500,color:C.warning}}>{v.toFixed(2)} €</span></div>)}</div>}
      <h3 style={{fontWeight:500,fontSize:15,margin:"0 0 10px"}}>Detalle</h3>
      {dt.length===0&&<div style={{fontSize:13,color:C.gray}}>Sin dietas para el período seleccionado.</div>}
      {dt.map(t=>{const cli=gc(t.clienteid),op=gu(t.asignadoa);return(
        <div key={t.id} style={{background:"#fff",border:"0.5px solid #e0e0e0",borderRadius:8,padding:"10px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:500}}>{t.titulo}</div><div style={{fontSize:12,color:C.gray}}>{op.nombre} · {cli.nombre} · {t.fecha}</div></div>
          <span style={{fontWeight:500,color:C.warning,fontSize:14}}>{t.dieta} €</span>
        </div>
      );})}
    </div>
  );
}

export default function App(){
  const[sess,setSess]=useState(null);
  const[lu,setLu]=useState("");const[lp,setLp]=useState("");const[le,setLe]=useState("");
  const[loading,setLoading]=useState(false);
  const[sec,setSec]=useState("dashboard");
  const[selT,setSelT]=useState(null);const[selDay,setSelDay]=useState(null);
  const[calY,setCalY]=useState(2026);const[calM,setCalM]=useState(3);
  const[showNT,setShowNT]=useState(false);const[editT,setEditT]=useState(null);
  const[showNO,setShowNO]=useState(false);const