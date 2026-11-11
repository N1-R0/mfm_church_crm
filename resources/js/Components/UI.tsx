import type {CSSProperties,ReactNode,InputHTMLAttributes,SelectHTMLAttributes,TextareaHTMLAttributes} from 'react';
export function Card({children,className='',style}:{children:ReactNode;className?:string;style?:CSSProperties}){return <section className={`card ${className}`} style={style}>{children}</section>}
export function Badge({children,tone='default'}:{children:ReactNode;tone?:'default'|'success'|'warning'|'muted'|'danger'}){return <span className={`badge badge-${tone}`}>{children}</span>}
export function Field({label,error,children,hint}:{label:string;error?:string;children:ReactNode;hint?:string}){return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}{error&&<small className="error">{error}</small>}</label>}
export function Input(p:InputHTMLAttributes<HTMLInputElement>){return <input {...p} className={`input ${p.className??''}`}/>}
export function Select(p:SelectHTMLAttributes<HTMLSelectElement>){return <select {...p} className={`input ${p.className??''}`}/>}
export function Textarea(p:TextareaHTMLAttributes<HTMLTextAreaElement>){return <textarea {...p} className={`input textarea ${p.className??''}`}/>}
export function Button({children,variant='primary',...p}:React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'danger'|'ghost'}){return <button {...p} className={`btn btn-${variant} ${p.className??''}`}>{children}</button>}
export function Empty({title,detail}:{title:string;detail:string}){return <div className="empty"><strong>{title}</strong><p>{detail}</p></div>}
export const money=(n:number,currency='USD')=>new Intl.NumberFormat(undefined,{style:'currency',currency,maximumFractionDigits:0}).format(n);
export const date=(d?:string)=>d?new Intl.DateTimeFormat(undefined,{dateStyle:'medium'}).format(new Date(d)): '—';
