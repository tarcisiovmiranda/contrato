import { useState } from 'react'

// Formatters
const formatCNPJ = v => v.replace(/\D/g,'').slice(0,14).replace(/(\d{2})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1/$2').replace(/(\d{4})(\d)/,'$1-$2')
const formatCEP = v => v.replace(/\D/g,'').replace(/(\d{5})(\d)/,'$1-$2')
const formatPhone = v => { const d=v.replace(/\D/g,''); return d.length>10?d.replace(/(\d{2})(\d{5})(\d)/,'($1) $2-$3'):d.replace(/(\d{2})(\d{4})(\d)/,'($1) $2-$3') }
const formatDate = v => { const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(v); return m?`${m[3]}/${m[2]}/${m[1]}`:v }
const formatCapital = v => typeof v==='number'?v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):v
const formatBool = v => v===true?'Sim':v===false?'Não':v

const isDate = v => typeof v==='string'&&/^\d{4}-\d{2}-\d{2}/.test(v)
const isCEP = (k,v) => typeof v==='string'&&/cep/i.test(k)
const isPhone = (k,v) => typeof v==='string'&&/tel|fone|phone/i.test(k)
const isCapital = k => /capital/i.test(k)
const isBool = v => typeof v==='boolean'

function smartFormat(key, value) {
  if(isBool(value)) return formatBool(value)
  if(isDate(value)) return formatDate(value)
  if(isCapital(key)) return formatCapital(value)
  if(isCEP(key,value)) return formatCEP(value)
  if(isPhone(key,value)) return formatPhone(value)
  return String(value)
}

function countFilledFields(obj, count=0) {
  if(!obj||typeof obj!=='object') return count
  for(const v of Object.values(obj)) {
    if(v===null||v===undefined||v==='') continue
    if(typeof v==='object'&&!Array.isArray(v)) { count=countFilledFields(v,count) }
    else if(Array.isArray(v)) { count+=v.length; for(const i of v) count=countFilledFields(i,count) }
    else count++
  }
  return count
}

function Badge({text,color='blue'}) {
  const colors={blue:'bg-blue-100 text-blue-800',green:'bg-green-100 text-green-800',red:'bg-red-100 text-red-800',yellow:'bg-yellow-100 text-yellow-800',gray:'bg-gray-100 text-gray-700'}
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colors[color]||colors.gray}`}>{text}</span>
}

function situacaoBadge(s) {
  if(!s) return null
  const t=s.toUpperCase()
  if(t.includes('ATIVA')) return <Badge text={s} color="green"/>
  if(t.includes('BAIXADA')) return <Badge text={s} color="red"/>
  if(t.includes('SUSPENSA')||t.includes('INAPTA')) return <Badge text={s} color="yellow"/>
  return <Badge text={s} color="gray"/>
}

function SituacaoCard({situacao}) {
  if(!situacao) return null
  const t = situacao.toUpperCase()
  const isAtiva = t.includes('ATIVA') && !t.includes('INAPTA')
  const isInapta = t.includes('INAPTA')
  const isBaixada = t.includes('BAIXADA')
  const isSuspensa = t.includes('SUSPENSA')

  let label, icon, bg, textColor, border
  if(isAtiva)    { label='APTA';    bg='bg-green-50';  border='border-green-200'; textColor='text-green-700'; icon='✓' }
  else if(isInapta)  { label='INAPTA';  bg='bg-yellow-50'; border='border-yellow-200'; textColor='text-yellow-700'; icon='!' }
  else if(isBaixada) { label='BAIXADA'; bg='bg-red-50';    border='border-red-200';    textColor='text-red-700';    icon='✕' }
  else if(isSuspensa){ label='SUSPENSA';bg='bg-orange-50'; border='border-orange-200'; textColor='text-orange-700'; icon='⚠' }
  else               { label=situacao;  bg='bg-gray-50';   border='border-gray-200';   textColor='text-gray-700';   icon='?' }

  return (
    <div className={`rounded-xl border ${bg} ${border} p-4 col-span-2`}>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Situação Cadastral</p>
      <div className="flex items-center gap-3">
        <span className={`w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold ${bg} ${textColor} border-2 ${border}`}>{icon}</span>
        <div>
          <p className={`text-xl font-bold ${textColor}`}>{label}</p>
          <p className="text-xs text-gray-500">{situacao}</p>
        </div>
      </div>
    </div>
  )
}

function DynamicValue({label, value}) {
  if(value===null||value===undefined) return null
  if(Array.isArray(value)) {
    if(value.length===0) return null
    return (
      <div className="col-span-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="space-y-2">
          {value.map((item,i)=>(
            <div key={i} className="bg-gray-50 rounded p-2 border border-gray-100">
              {typeof item==='object'&&item!==null
                ? <DynamicObject data={item}/>
                : <span className="text-gray-800 text-sm">{smartFormat(label,item)}</span>
              }
            </div>
          ))}
        </div>
      </div>
    )
  }
  if(typeof value==='object') {
    return (
      <div className="col-span-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="bg-gray-50 rounded p-2 border border-gray-100"><DynamicObject data={value}/></div>
      </div>
    )
  }
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-gray-800 text-sm font-medium mt-0.5 break-words">{smartFormat(label,value)}</p>
    </div>
  )
}

function DynamicObject({data}) {
  if(!data||typeof data!=='object') return null
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(data).map(([k,v])=><DynamicValue key={k} label={k} value={v}/>)}
    </div>
  )
}

const SKIP_IN_SUMMARY = ['razao_social','nome_fantasia','descricao_situacao_cadastral','logradouro','numero','complemento','bairro','municipio','uf','cep','ddd_telefone_1','ddd_telefone_2','email','cnae_fiscal_descricao','capital_social','inscricoes_estaduais','pais']

function InfoCard({label,value,full=false}) {
  if(!value&&value!==0) return null
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${full?'col-span-2':''}`}>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-gray-900 font-medium break-words">{value}</p>
    </div>
  )
}

export default function App() {
  const [cnpj, setCnpj] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleInput = e => setCnpj(formatCNPJ(e.target.value))

  const consultar = async () => {
    const clean = cnpj.replace(/\D/g,'')
    if(clean.length!==14){setError('Digite um CNPJ válido com 14 dígitos.');return}
    setLoading(true); setError(''); setData(null); setShowRaw(false)
    try {
      const res = await fetch(`https://publica.cnpj.ws/cnpj/${clean}`)
      if(!res.ok) {
        const msg = res.status===404?'CNPJ não encontrado.':res.status===429?'Muitas consultas. Aguarde alguns segundos.':'Erro ao consultar. Tente novamente.'
        throw new Error(msg)
      }
      const json = await res.json()
      setData(json)
    } catch(e){setError(e.message)} finally{setLoading(false)}
  }

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data,null,2))
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  const telefone = data ? [data.ddd_telefone_1,data.ddd_telefone_2].filter(Boolean).map(t=>formatPhone(t.replace(/\D/g,''))).join(' / ') : ''
  const endereco = data ? `${data.logradouro||''}, ${data.numero||''} ${data.complemento||''} — ${data.bairro||''}`.replace(/\s+/g,' ').trim() : ''
  const cidade = data ? data.municipio?.descricao||'' : ''
  const pais = data ? (data.pais?.descricao || data.pais || 'Brasil') : ''

  const extraData = data ? Object.fromEntries(Object.entries(data).filter(([k])=>!SKIP_IN_SUMMARY.includes(k))) : {}
  const filled = data ? countFilledFields(data) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-3 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Consulta CNPJ</h1>
          <p className="text-blue-300 mt-1 text-sm">Dados completos via API pública</p>
        </div>

        {/* Search */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6 border border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={cnpj}
              onChange={handleInput}
              onKeyDown={e=>e.key==='Enter'&&consultar()}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="flex-1 bg-white rounded-xl px-4 py-3 text-gray-900 text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 placeholder:font-sans placeholder:tracking-normal placeholder:text-base"
            />
            <button
              onClick={consultar}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : 'Consultar'}
            </button>
          </div>
          {error && (
            <div className="mt-3 flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 rounded-lg px-4 py-2 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {error}
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white rounded-2xl p-6 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-2/3"/>
            <div className="h-4 bg-gray-100 rounded w-1/3"/>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[...Array(6)].map((_,i)=><div key={i} className="h-16 bg-gray-100 rounded-xl"/>)}
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-4">

            {/* Header card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{data.razao_social}</h2>
                  {data.nome_fantasia && <p className="text-gray-500 mt-0.5">{data.nome_fantasia}</p>}
                  <p className="text-blue-600 font-mono text-sm mt-1">{formatCNPJ(cnpj.replace(/\D/g,''))}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {situacaoBadge(data.descricao_situacao_cadastral)}
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{filled} campos preenchidos</span>
                </div>
              </div>
            </div>

            {/* Situação destacada */}
            <div className="grid grid-cols-2 gap-3">
              <SituacaoCard situacao={data.descricao_situacao_cadastral}/>
            </div>

            {/* Summary grid */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard label="Endereço" value={endereco} full/>
              <InfoCard label="Cidade" value={cidade}/>
              <InfoCard label="Estado (UF)" value={data.uf}/>
              <InfoCard label="País" value={pais}/>
              <InfoCard label="CEP" value={data.cep?formatCEP(data.cep):''}/>
              <InfoCard label="CNAE Principal" value={data.cnae_fiscal_descricao} full/>
              <InfoCard label="Telefone" value={telefone} full/>
              <InfoCard label="E-mail" value={data.email} full/>
              <InfoCard label="Capital Social" value={data.capital_social?formatCapital(data.capital_social):''}/>
            </div>

            {/* Inscrições estaduais */}
            {data.inscricoes_estaduais?.length>0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Inscrições Estaduais</h3>
                <div className="space-y-2">
                  {data.inscricoes_estaduais.map((ie,i)=>(
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <Badge text={ie.estado||ie.uf||'UF'} color="blue"/>
                      <span className="font-mono text-gray-700">{ie.inscricao_estadual||ie.numero||JSON.stringify(ie)}</span>
                      {ie.ativo!==undefined&&<Badge text={ie.ativo?'Ativa':'Inativa'} color={ie.ativo?'green':'red'}/>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic extra data */}
            {Object.keys(extraData).length>0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Dados Completos</h3>
                <DynamicObject data={extraData}/>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <button onClick={()=>setShowRaw(v=>!v)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-all border border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
                {showRaw?'Ocultar JSON':'Ver JSON bruto'}
              </button>
              <button onClick={copyJSON} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition-all border border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                {copied?'Copiado!':'Copiar JSON'}
              </button>
            </div>

            {/* Raw JSON */}
            {showRaw && (
              <div className="bg-gray-900 rounded-2xl p-5 overflow-x-auto">
                <pre className="text-green-400 text-xs leading-relaxed">{JSON.stringify(data,null,2)}</pre>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-blue-900/40 text-xs mt-8">Dados fornecidos por publica.cnpj.ws</p>
      </div>
    </div>
  )
}
