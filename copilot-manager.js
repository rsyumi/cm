//@name copilot-manager
//@display-name Copilot Manager v1.0.0
//@version 1.0.0
//@api 3.0
//@update-url https://raw.githubusercontent.com/rsyumi/cm/refs/heads/main/copilot-manager.js
//@arg github_token string GitHub Token
//@arg streaming string 스트리밍 (true/false)
//@arg native_fetch string nativeFetch 사용 (true/false)
//@arg claude_format string Claude API 형식 (anthropic/openai)
//@arg thinking_mode string Thinking 모드 (off/low/medium/high/max)
//@arg verbosity string Verbosity (off/low/medium/high)
//@arg thinking_budget int Thinking Budget (0=disabled)
//@arg show_thinking string Thinking 표시 (true/false)
//@arg decoupled_streaming string Decoupled 스트리밍 (true/false)
//@arg machine_id string Machine ID
//@arg vscode_version string VS Code 버전 (비워두면 기본값)
//@arg chat_version string Copilot Chat 버전 (비워두면 기본값)
(function(){"use strict";const I="Copilot Manager",Te="1.0.0",Ee=`[${I}]`;function S(e){const t=`${Ee}[${e}]`;return{debug(n,...o){console.debug(t,n,...o)},info(n,...o){console.info(t,n,...o)},warn(n,...o){console.warn(t,n,...o)},error(n,...o){console.error(t,n,...o)}}}const m=Risuai,T={hasImageInput:0,hasPrefill:4,hasCache:5,hasFullSystemPrompt:6,hasStreaming:8,claudeThinking:21,claudeAdaptiveThinking:22},Me={tiktokenO200Base:2},y=S("Config"),p={GITHUB_TOKEN:"github_token",STREAMING:"streaming",DECOUPLED_STREAMING:"decoupled_streaming",NATIVE_FETCH:"native_fetch",CLAUDE_FORMAT:"claude_format",THINKING_MODE:"thinking_mode",THINKING_BUDGET:"thinking_budget",SHOW_THINKING:"show_thinking",VERBOSITY:"verbosity",MACHINE_ID:"machine_id",VSCODE_VERSION:"vscode_version",CHAT_VERSION:"chat_version"},ne="copilot_machine_id";async function k(e,t=""){try{return await m.getArgument(e)??t}catch{return y.warn(`arg 읽기 실패: ${e}, 기본값 사용: ${t}`),t}}async function N(e,t=!1){return await k(e,t?"true":"false")==="true"}async function Ae(e,t=0){try{const n=await m.getArgument(e),o=Number(n);return isNaN(o)?t:o}catch{return y.warn(`int arg 읽기 실패: ${e}, 기본값 사용: ${t}`),t}}async function $(e,t){try{const n=typeof t=="boolean"?t?"true":"false":String(t);await m.setArgument(e,n)}catch(n){y.error(`arg 쓰기 실패: ${e}`,n)}}async function Ce(){const e=await k(p.MACHINE_ID);if(e&&e.length>=64)return y.info("Machine ID from @arg"),e;try{const n=await m.safeLocalStorage.getItem(ne);if(n&&n.length>=64)return await $(p.MACHINE_ID,n),y.info("Machine ID from safeLocalStorage"),n}catch{y.warn("safeLocalStorage에서 Machine ID 로드 실패")}const t=Array.from({length:65},()=>Math.floor(Math.random()*16).toString(16)).join("");y.info("새 Machine ID 생성");try{await m.safeLocalStorage.setItem(ne,t)}catch{y.warn("safeLocalStorage에 Machine ID 저장 실패")}return await $(p.MACHINE_ID,t),t}async function _(){const[e,t,n,o,a,i,c,r,d,u,l,g]=await Promise.all([k(p.GITHUB_TOKEN),N(p.STREAMING,!0),N(p.DECOUPLED_STREAMING,!1),N(p.NATIVE_FETCH,!0),k(p.CLAUDE_FORMAT,"anthropic"),k(p.THINKING_MODE,"off"),Ae(p.THINKING_BUDGET,0),N(p.SHOW_THINKING,!1),k(p.VERBOSITY,""),k(p.MACHINE_ID),k(p.VSCODE_VERSION),k(p.CHAT_VERSION)]),b={githubToken:e,streaming:t,decoupledStreaming:n,nativeFetch:o,claudeFormat:a==="openai"?"openai":"anthropic",thinkingMode:["off","low","medium","high","max"].includes(i)?i:"off",thinkingBudget:c,showThinking:r,verbosity:["low","medium","high"].includes(d)?d:"",machineId:u,vscodeVersion:l,chatVersion:g};return y.info("설정 로드 완료",{streaming:b.streaming,nativeFetch:b.nativeFetch,claudeFormat:b.claudeFormat,thinkingMode:b.thinkingMode}),b}const oe="01ab8ac9400c4e429b23",E="1.109.5",ie="0.37.9",Ne="https://api.individual.githubcopilot.com",se="https://api.github.com",ae="https://github.com";let F=Ne,D="",ce=0;function re(){return F}let O="",V="";function De(e){O=e}function L(e){return`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/${e} Chrome/142.0.7444.265 Electron/39.3.0 Safari/537.36`}function Oe(){return Array.from({length:64},()=>Math.floor(Math.random()*16).toString(16)).join("")}function Le(){return(crypto.randomUUID?.()??Date.now().toString())+Date.now().toString()}async function Re(e){const t=L(E),n=await m.risuFetch(`${ae}/login/device/code`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","User-Agent":t},body:{client_id:oe,scope:"user:email"},rawResponse:!1,plainFetchDeforce:!0});if(!n.ok)throw new Error(`Device code request failed: ${JSON.stringify(n.data)}`);return n.data}async function Ge(e,t){const n=L(E),o=await m.risuFetch(`${ae}/login/oauth/access_token`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","User-Agent":n},body:{client_id:oe,device_code:e,grant_type:"urn:ietf:params:oauth:grant-type:device_code"},rawResponse:!1,plainFetchDeforce:!0});if(!o.ok)throw new Error(`Access token request failed: ${JSON.stringify(o.data)}`);const a=o.data;if(a.error==="authorization_pending")throw new Error("Authorization is still pending. Please complete the device flow first.");if(!a.access_token)throw new Error(`No access token in response: ${JSON.stringify(a)}`);return a.access_token}async function P(e,t,n){const o=L(E),a=await m.risuFetch(`${se}/copilot_internal/user`,{method:"GET",headers:{Accept:"application/json",Authorization:`Bearer ${e}`,Origin:"vscode-file://vscode-app","User-Agent":o},rawResponse:!1,plainFetchDeforce:!0});if(!a.ok)throw new Error(`User info request failed: ${JSON.stringify(a.data)}`);const i=a.data;return i.endpoints?.api&&(F=i.endpoints.api),i}async function He(e){const t=await m.risuFetch(`${F}/models`,{method:"GET",headers:{Accept:"application/json",Authorization:`Bearer ${e}`},rawResponse:!1,plainFetchDeforce:!0});if(!t.ok)throw new Error(`Models request failed: ${JSON.stringify(t.data)}`);return t.data}async function Be(e,t){if(!e)throw new Error("GitHub token is required to obtain a tid token");if(D&&Date.now()<ce-6e4)return D;const n=L(t?.codeVersion??E),o=await m.risuFetch(`${se}/copilot_internal/v2/token`,{method:"GET",headers:{Accept:"application/json",Authorization:`Bearer ${e}`,Origin:"vscode-file://vscode-app","User-Agent":n},rawResponse:!1,plainFetchDeforce:!0});if(!o.ok)throw new Error(`Tid token request failed: ${JSON.stringify(o.data)}`);const a=o.data;if(!a.token||!a.expires_at)throw new Error(`Invalid tid token response: ${JSON.stringify(a)}`);return D=a.token,ce=a.expires_at*1e3,D}async function Ue(e,t){const n=t?.versions?.codeVersion??E,o=t?.versions?.chatVersion??ie;O||(O=Oe()),V||(V=Le());const i={Authorization:`Bearer ${await Be(e,t?.versions)}`,"Content-Type":"application/json","Copilot-Integration-Id":"vscode-chat","Editor-plugin-version":`copilot-chat/${o}`,"Editor-version":`vscode/${n}`,"User-Agent":`GitHubCopilotChat/${o}`,"Vscode-Machineid":O,"Vscode-Sessionid":V,"X-Github-Api-Version":"2025-10-01","X-Initiator":"user","X-Interaction-Id":crypto.randomUUID?.()??Date.now().toString(),"X-Interaction-Type":"conversation-panel","X-Request-Id":crypto.randomUUID?.()??Date.now().toString(),"X-Vscode-User-Agent-Library-Version":"electron-fetch"};return t?.hasVisionContent&&(i["Copilot-Vision-Request"]="true"),i}async function*de(e){const t=new TextDecoder;let n="";for(;;){const{done:o,value:a}=await e.read();if(o)break;n+=t.decode(a,{stream:!0});const i=n.split(`
`);n=i.pop()??"";for(const c of i){const r=c.trim();if(!(!r||r.startsWith(":"))&&r.startsWith("data: ")){const d=r.slice(6);if(d==="[DONE]")return;try{yield JSON.parse(d)}catch{}}}}}function z(e){return{inputTokens:e.input_tokens,outputTokens:e.output_tokens,cachedInputTokens:(e.cache_read_input_tokens||0)+(e.cache_creation_input_tokens||0)||void 0}}function le(e){return{inputTokens:e.prompt_tokens,outputTokens:e.completion_tokens,totalTokens:e.total_tokens}}function q(e){return{text:e,done:!1}}function R(e){return{thinking:e,done:!1}}function ue(e,t){return{done:!0,usage:e,stopReason:t}}function Fe(e){const t=e.content;let n="",o="";for(const i of t??[])i.type==="thinking"?o+=i.thinking??"":i.type==="redacted_thinking"?o+="[REDACTED]":i.type==="text"&&(n+=i.text??"");const a=e.usage?z(e.usage):void 0;return{content:n,thinking:o||void 0,usage:a,stopReason:e.stop_reason,raw:e}}async function*Ve(e){let t,n;for await(const o of de(e))switch(o.type){case"message_start":{const i=o.message;i?.usage&&(t=z(i.usage));break}case"message_delta":{const i=o.delta;if(i?.stop_reason&&(n=i.stop_reason),o.usage){const c=z(o.usage);t={...t,...c}}break}case"content_block_start":{const i=o.content_block;i?.type==="thinking"&&(yield R("")),i?.type==="text"&&i?.text&&(yield q(i.text));break}case"content_block_delta":{const i=o.delta;i.type==="thinking_delta"||i.type==="thinking"?i.thinking&&(yield R(i.thinking)):i.type==="text_delta"||i.type==="text"?i.text&&(yield q(i.text)):i.type==="redacted_thinking"&&(yield R("[REDACTED]"));break}case"error":{const i=o.error;throw new Error(`Anthropic stream error: ${i?.message??JSON.stringify(i)}`)}}yield ue(t,n)}function Pe(e){const t=e.choices;if(!t?.length)throw new Error("OpenAI returned no choices");const n=t[0],o=n.message,a=o.content??"";let i;const c=o.reasoning_content??o.reasoning;c&&(i=c);const r=e.usage?le(e.usage):void 0;return{content:a,thinking:i,usage:r,stopReason:n.finish_reason,raw:e}}async function*ze(e){let t,n;for await(const o of de(e)){o.usage&&(t=le(o.usage));const a=o.choices;if(a?.length)for(const i of a){const c=i.delta;c?.content&&(yield q(c.content));const r=c?.reasoning_content??c?.reasoning;r&&(yield R(r)),i.finish_reason&&(n=i.finish_reason)}}yield ue(t,n)}const M=S("Stream");let G=null;async function pe(){if(G!==null)return G;try{const e=new ReadableStream({start(n){n.enqueue("test"),n.close()}}),t=await new Promise(n=>{const o=new MessageChannel;o.port1.onmessage=a=>{const i=a.data;n(i instanceof ReadableStream),o.port1.close()},o.port1.onmessageerror=()=>{n(!1),o.port1.close()};try{o.port2.postMessage(e,[e])}catch{try{o.port2.postMessage({stream:e})}catch{n(!1)}}o.port2.close(),setTimeout(()=>n(!1),1e3)});return G=t,M.info("Bridge 스트림 지원 감지 완료",{supported:t}),t}catch{return G=!1,M.warn("Bridge 스트림 지원 감지 실패, 비스트리밍으로 폴백"),!1}}async function*me(e,t,n){const o=e.getReader(),a=t==="anthropic"?Ve:ze;let i="",c=!1;try{for await(const r of a(o)){if(r.done){n&&c&&i&&(yield`
</Thoughts>

`);break}if(r.thinking){if(!n)continue;c||(c=!0,yield`<Thoughts>
`),i+=r.thinking,yield r.thinking}r.text&&(n&&c&&(yield`
</Thoughts>

`,c=!1,i=""),yield r.text)}}finally{o.releaseLock()}}async function j(e,t,n){let o="";for await(const a of me(e,t,n))o+=a;return o}async function qe(e,t,n){try{return n.decoupledStreaming?(M.info("Decoupled 스트리밍: 전체 수집"),{success:!0,content:await j(e,t,n.showThinking)}):await pe()?(M.info("실시간 스트리밍: ReadableStream 반환"),{success:!0,content:new ReadableStream({async start(c){try{for await(const r of me(e,t,n.showThinking))c.enqueue(r);c.close()}catch(r){c.error(r)}}})}):(M.info("Bridge 미지원: 전체 수집으로 폴백"),{success:!0,content:await j(e,t,n.showThinking)})}catch(o){const a=o instanceof Error?o.message:String(o);return M.error("스트림 처리 실패",o),{success:!1,content:`[${I}] Stream Error: ${a}`}}}const x=S("Request");function je(e){const t=new TextEncoder;return new ReadableStream({start(n){n.enqueue(t.encode(e)),n.close()}})}function fe(e){if(!e)return e;let t=e.replace(/\{\{inlay::.*?\}\}/g,"");return t=t.replace(/<qak>[\s\S]*?<\/qak>/g,""),t}function Ke(e){const t=[];for(const n of e){if(n.content==null)continue;let o=n.role;o==="char"&&(o="assistant");const a=fe(typeof n.content=="string"?n.content:String(n.content));if(!a)continue;const i=n;if(i.multimodals?.length&&(o==="user"||o==="system")){const c=[{type:"text",text:a}];for(const r of i.multimodals)r.type==="image"&&c.push({type:"image_url",image_url:{url:`data:image/png;base64,${r.base64}`}});t.push({role:o,content:c})}else t.push({role:o,content:a})}return t}function Je(e){let t="";const n=[];for(const i of e){if(i.content==null)continue;const c=fe(typeof i.content=="string"?i.content:String(i.content));if(!c)continue;const r=i;let d=i.role;if(d==="char"&&(d="assistant"),d==="system"&&n.length===0)t+=(t?`

`:"")+c;else{const u=[];if(r.multimodals?.length&&d!=="assistant"){for(const g of r.multimodals)if(g.type==="image"){const b=(g.base64||"").replace(/^data:image\/[^;]+;base64,/,"");u.push({type:"image",source:{type:"base64",media_type:g.mimeType||"image/png",data:b}})}}const l=d==="system"?`system: ${c}`:c;d==="system"&&(d="user"),u.push({type:"text",text:l}),n.push({role:d,content:u,cachePoint:r.cachePoint})}}const o=[];for(const i of n)o.length>0&&o[o.length-1].role===i.role?(o[o.length-1].content.push(...i.content),i.cachePoint&&(o[o.length-1].cachePoint=!0)):o.push({...i,content:[...i.content]});o.length>0&&o[0].role!=="user"&&o.unshift({role:"user",content:[{type:"text",text:"Start"}]});const a=o.map(i=>{const c=i.content.map(r=>({...r}));return i.cachePoint&&c.length>0&&(c[c.length-1].cache_control={type:"ephemeral"}),{role:i.role,content:c}});return{system:t,messages:a}}function Ye(e){return/^(gpt-5|gpt-4\.5|o[1-9]|o3)/.test(e)}function Xe(e){return e.vendor==="Anthropic"}function We(e){return e.supported_endpoints?.includes("/v1/messages")??!1}function Qe(e){return e.capabilities?.supports?.adaptive_thinking===!0||/(opus-4.6|sonnet-4.6)/.test(e.id)}function Ze(e){return e.id.includes("opus")===!0}function et(e){return(e.capabilities?.supports?.reasoning_effort?.length??0)>0||e.id.includes("gpt-5")}function tt(e,t,n){return t.thinkingMode==="off"&&t.thinkingBudget<=0?{body:n,removeTemperature:!1}:Qe(e)?(n.thinking={type:"adaptive"},t.thinkingMode!=="off"&&(n.output_config={effort:t.thinkingMode==="max"&&Ze(e)?"high":t.thinkingMode}),{body:n,removeTemperature:!0}):t.thinkingBudget>0?(n.thinking={type:"enabled",budget_tokens:t.thinkingBudget},n.max_tokens<=t.thinkingBudget&&(n.max_tokens=t.thinkingBudget+4096),{body:n,removeTemperature:!0}):{body:n,removeTemperature:!1}}function nt(e,t){if(e.thinkingMode==="off"&&e.thinkingBudget<=0)return{body:t,removeTemperature:!1};let n;if(e.thinkingMode!=="off")n=e.thinkingMode==="max"?"high":e.thinkingMode;else if(e.thinkingBudget>0)e.thinkingBudget<=1024?n="low":e.thinkingBudget<=8192?n="medium":n="high";else return{body:t,removeTemperature:!1};return t.reasoning_effort=n,{body:t,removeTemperature:!0}}function ot(e,t,n,o){const{system:a,messages:i}=Je(t.prompt_chat),c={model:e.id,messages:i,max_tokens:t.max_tokens||4096,stream:o};if(a&&(c.system=[{type:"text",text:a}]),t.temperature&&(c.temperature=Math.min(t.temperature,1)),t.top_p&&(c.top_p=Math.min(t.top_p,1)),t.top_k&&(c.top_k=t.top_k),tt(e,n,c).removeTemperature){delete c.temperature,delete c.top_k;const d=c.messages;d.length>0&&d[d.length-1].role==="assistant"&&d.pop()}return c}function it(e,t,n,o){const a=Ke(t.prompt_chat),i={model:e.id,messages:a};return Ye(e.id)?i.max_completion_tokens=t.max_tokens||4096:i.max_tokens=t.max_tokens||4096,t.temperature!==void 0&&(i.temperature=t.temperature),t.top_p!==void 0&&(i.top_p=t.top_p),t.frequency_penalty!==void 0&&(i.frequency_penalty=t.frequency_penalty),t.presence_penalty!==void 0&&(i.presence_penalty=t.presence_penalty),et(e)&&nt(n,i).removeTemperature&&delete i.temperature,n.verbosity&&(i.verbosity=n.verbosity),o&&(i.stream=!0,i.stream_options={include_usage:!0}),i}async function st(e,t){try{const n=await _();x.info("요청 시작",{model:e.id,vendor:e.vendor});const o=Xe(e)&&n.claudeFormat==="anthropic"&&We(e),a=o?`${re()}/v1/messages`:`${re()}/chat/completions`,i=o?"anthropic":"openai";x.info("라우팅 결정",{endpoint:a,format:i});const c=o?ot(e,t,n,n.streaming):it(e,t,n,n.streaming);x.debug("요청 body",c);const r={};n.vscodeVersion&&(r.codeVersion=n.vscodeVersion),n.chatVersion&&(r.chatVersion=n.chatVersion);const d=await Ue(n.githubToken,{versions:r});if(o&&(d["anthropic-version"]="2023-06-01"),t.prompt_chat.some(l=>l.multimodals?.some(b=>b.type==="image"))&&(d["Copilot-Vision-Request"]="true"),n.nativeFetch){const l=await m.nativeFetch(a,{method:"POST",headers:d,body:JSON.stringify(c)});if(!l?.ok&&l.status!==200){const g=await l.text();return x.error("API 에러",{status:l.status,body:g}),{success:!1,content:`[${I}] API Error ${l.status}: ${g}`}}if(n.streaming&&l.body)return qe(l.body,i,n);{const g=await l.json();return he(g,i)}}else{const l=await m.risuFetch(a,{method:"POST",headers:d,body:c});if(!l.ok&&l.status!==200)return x.error("API 에러 (risuFetch)",{status:l.status,data:l.data}),{success:!1,content:`[${I}] API Error ${l.status}: ${JSON.stringify(l.data)}`};if(n.streaming&&typeof l.data=="string"){x.info("risuFetch SSE 텍스트 파싱");const b=je(l.data);return{success:!0,content:await j(b,i,n.showThinking)}}const g=l.data;return he(g,i)}}catch(n){const o=n instanceof Error?n.message:String(n);return x.error("요청 처리 실패",n),{success:!1,content:`[${I}] Error: ${o}`}}}function he(e,t){try{const n=t==="anthropic"?Fe(e):Pe(e);let o=n.content;return n.thinking&&(o=`<Thoughts>
${n.thinking}
</Thoughts>

${o}`),x.info("응답 파싱 완료",{contentLength:o.length,hasThinking:!!n.thinking}),{success:!0,content:o}}catch(n){const o=n instanceof Error?n.message:String(n);return x.error("응답 파싱 실패",n),{success:!1,content:`[${I}] Parse Error: ${o}`}}}const v=S("Provider"),K="copilot_models",J="copilot_hidden_models",Y="copilot_github_model_ids",X="copilot_remote_model_ids",at="https://raw.githubusercontent.com/rsyumi/cm/refs/heads/main/models.json";async function W(){try{const e=await m.pluginStorage.getItem(J);if(e)return JSON.parse(e)}catch{}return[]}async function ct(e){try{await m.pluginStorage.setItem(J,JSON.stringify(e))}catch(t){v.warn("숨김 모델 저장 실패",t)}}async function rt(e){const t=await W(),n=t.indexOf(e);return n>=0?t.splice(n,1):t.push(e),await ct(t),n<0}async function ge(e){try{const t=await m.pluginStorage.getItem(e);if(t)return JSON.parse(t)}catch{}return[]}async function be(e,t){try{await m.pluginStorage.setItem(e,JSON.stringify(t))}catch{}}const ve=()=>ge(Y),dt=()=>ge(X);function $e(e){return e.filter(t=>{if(t.capabilities?.type!=="chat")return!1;const n=t.supported_endpoints??["/chat/completions"];return n.includes("/chat/completions")||n.includes("/v1/messages")})}async function lt(){try{const e=await m.nativeFetch(at,{method:"GET",headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`Remote models fetch failed: ${e.status}`);const n=(await e.json())?.data??[],o=$e(n);return v.info(`원격 모델: ${n.length}개 중 ${o.length}개 선택`),await be(X,o.map(a=>a.id)),o}catch(e){return v.warn("원격 모델 로드 실패",e),[]}}async function ut(e){const n=(await He(e)).data??[],o=$e(n);return v.info(`GitHub 모델 필터링: ${n.length}개 중 ${o.length}개 선택`),await be(Y,o.map(a=>a.id)),o}async function we(){try{const e=await m.pluginStorage.getItem(K);if(e){const t=JSON.parse(e);return v.info(`캐시에서 모델 ${t.length}개 로드`),t}}catch(e){v.warn("모델 캐시 로드 실패",e)}return[]}async function pt(e,t){const n=await we(),o=new Map;for(const d of n)o.set(d.id,d);for(const d of e)o.set(d.id,d);for(const d of t)o.set(d.id,d);const a=new Map;for(const d of o.values()){const u=d.version;if(!u)continue;const l=a.get(u);(!l||d.id.length<=l.id.length)&&a.set(u,d)}const i=new Set(Array.from(a.values()).map(d=>d.id));for(const d of o.values())d.version||i.add(d.id);const c=Array.from(o.values()).filter(d=>i.has(d.id)),r=o.size-c.length;try{await m.pluginStorage.setItem(K,JSON.stringify(c))}catch(d){v.warn("모델 캐시 저장 실패",d)}return v.info(`모델 병합: cached=${n.length}, remote=${e.length}, github=${t.length} → total=${c.length} (${r}개 version 중복 제거)`),c}async function H(e,t,n){const o=new Set(await W());return e.map(a=>({model:a,inRemote:t.has(a.id),inGithub:n.has(a.id),hidden:o.has(a.id)}))}async function ye(){const e=await we(),t=new Set(await dt()),n=new Set(await ve());return H(e,t,n)}async function Q(e){const t=await lt(),n=new Set(t.map(c=>c.id));let o=[];if(e)try{o=await ut(e)}catch(c){v.warn("GitHub 모델 로드 실패, 저장된 ID 사용",c)}const a=new Set(o.length>0?o.map(c=>c.id):await ve());return{models:await pt(t,o),remoteIds:n,githubIds:a}}async function mt(){const e=[K,J,Y,X];for(const t of e)try{await m.pluginStorage.removeItem(t)}catch{}v.info("모든 모델 데이터 초기화 완료")}function ft(e){const t=[T.hasStreaming,T.hasFullSystemPrompt],n=e.capabilities?.supports;return n?.vision&&t.push(T.hasImageInput),n?.adaptive_thinking&&t.push(T.claudeAdaptiveThinking),e.vendor==="Anthropic"&&t.push(T.claudeThinking,T.hasPrefill,T.hasCache),t}function ht(e){return["temperature","top_p","frequency_penalty","presence_penalty"]}function gt(e){return{id:e.id,name:e.name,flags:ft(e),parameters:ht(),tokenizer:Me.tiktokenO200Base}}async function bt(e){const t=new Set(await W()),n=e.filter(i=>!t.has(i.id));v.info(`프로바이더 등록 시작: ${e.length}개 중 ${n.length}개 (${t.size}개 숨김)`);const o=new Map;for(const i of n)o.set(i.name,(o.get(i.name)??0)+1);let a=0;for(const i of n){const r=(o.get(i.name)??0)>1&&i.version?` (${i.version})`:"",d=`[${i.vendor}] ${i.name}${r}`;try{const u=async g=>{const b=await st(i,g);return{success:b.success,content:b.content}},l={model:gt(i)};await m.addProvider(d,u,l),a++}catch(u){v.error(`프로바이더 등록 실패: ${d}`,u)}}v.info(`프로바이더 ${a}/${n.length}개 등록 완료`)}const s={container:"cm-container",header:"cm-header",headerTitle:"cm-header-title",card:"cm-card cm-col",cardTitle:"cm-card-title",input:"cm-input",select:"cm-select",btn:"cm-btn",btnDanger:"cm-btn-danger",btnGhost:"cm-btn-ghost",btnClose:"cm-btn-close",checkbox:"cm-checkbox",label:"cm-label",labelBold:"cm-label-bold",value:"cm-value",success:"cm-success",error:"cm-error",warning:"cm-warning",muted:"cm-muted",row:"cm-row",rowBetween:"cm-row-between",col:"cm-col",grid2:"cm-grid-2",accordionHeader:"cm-accordion-header",accordionContent:"cm-accordion-content",chevron:"cm-chevron",modelItem:"cm-model-item",modelDetail:"cm-model-detail",progressBar:"cm-progress-bar",progressFill:"cm-progress-fill",badge:"cm-badge",badgeGreen:"cm-badge-green",badgeRed:"cm-badge-red",badgeYellow:"cm-badge-yellow",badgeGray:"cm-badge-gray",link:"cm-link",deviceCard:"cm-device-card",mb0:"cm-mb-0",mb1:"cm-mb-1",mb2:"cm-mb-2",mt1:"cm-mt-1",mt2:"cm-mt-2",mt3:"cm-mt-3",clickable:"cm-clickable",flex1:"cm-flex1",textSm:"cm-text-sm",textXs:"cm-text-xs",fw500:"cm-fw-500",inputNarrow:"cm-input-narrow",inputMono:"cm-input-mono",detailLabel:"cm-detail-label",gapSm:"cm-gap-sm"},vt=`
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-size:14px;line-height:1.5;color:#e2e8f0;background:#1a202c}
.cm-container{min-height:100vh;padding:16px;background:#1a202c;color:#e2e8f0}
.cm-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.cm-header-title{font-size:20px;font-weight:700;color:#fff;margin:0}
.cm-card{background:#2d3748;border-radius:8px;padding:16px;margin-bottom:16px}
.cm-card-title{font-size:12px;font-weight:600;color:#a0aec0;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px}
.cm-input,.cm-input-sm,.cm-select{background:#4a5568;color:#e2e8f0;border:1px solid #718096;border-radius:4px;outline:none;width:100%}
.cm-input:focus,.cm-input-sm:focus,.cm-select:focus{border-color:#4299e1}
.cm-input{padding:6px 12px;font-size:13px}
.cm-select{padding:8px 12px;appearance:auto}
.cm-btn,.cm-btn-danger,.cm-btn-ghost{border:none;border-radius:4px;font-size:13px;cursor:pointer;transition:background .15s}
.cm-btn{background:#3182ce;color:#fff;padding:6px 12px}
.cm-btn:hover{background:#2b6cb0}
.cm-btn-danger{background:#e53e3e;color:#fff;padding:6px 12px}
.cm-btn-danger:hover{background:#c53030}
.cm-btn-ghost{background:#4a5568;color:#cbd5e0;padding:6px 12px}
.cm-btn-ghost:hover{background:#718096}
.cm-btn-close{background:none;border:none;color:#a0aec0;font-size:24px;line-height:1;cursor:pointer;padding:0}
.cm-btn-close:hover{color:#fff}
button:disabled{opacity:.5;cursor:not-allowed}
.cm-checkbox{width:16px;height:16px;cursor:pointer;accent-color:#4299e1}
.cm-label{font-size:13px;color:#a0aec0}
.cm-label-bold{font-size:13px;font-weight:500;color:#cbd5e0}
.cm-value{font-size:13px;color:#e2e8f0}
.cm-success{color:#68d391}
.cm-error{color:#fc8181}
.cm-warning{color:#f6e05e}
.cm-muted{font-size:12px;color:#718096}
.cm-row{display:flex;align-items:center;gap:8px}
.cm-row-between{display:flex;align-items:center;justify-content:space-between}
.cm-col{display:flex;flex-direction:column;gap:4px}
.cm-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cm-accordion-header{display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:8px;margin:0 -8px;border-radius:4px}
.cm-accordion-header:hover{background:#4a5568}
.cm-accordion-content{padding-left:8px;margin-top:4px}
.cm-chevron{color:#a0aec0;font-size:13px}
.cm-model-item{padding:8px;border-radius:4px;cursor:pointer}
.cm-model-item:hover{background:#4a5568}
.cm-model-hidden{opacity:.45}
.cm-model-name{font-size:13px;font-weight:500;color:#e2e8f0}
.cm-model-detail{margin-top:8px;padding-left:16px;font-size:12px;color:#a0aec0}
.cm-model-detail>div{margin-bottom:4px}
.cm-btn-hide{background:none;border:1px solid #718096;border-radius:3px;color:#a0aec0;font-size:11px;padding:1px 6px;cursor:pointer;line-height:1.4}
.cm-btn-hide:hover{border-color:#a0aec0;color:#e2e8f0}
.cm-progress-bar{width:100%;background:#4a5568;border-radius:9999px;height:8px;overflow:hidden}
.cm-progress-fill{background:#4299e1;height:8px;border-radius:9999px;transition:width .3s}
.cm-badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500}
.cm-badge-green{background:#22543d;color:#9ae6b4}
.cm-badge-red{background:#742a2a;color:#feb2b2}
.cm-badge-yellow{background:#744210;color:#fefcbf}
.cm-badge-gray{background:#4a5568;color:#cbd5e0}
.cm-link{color:#63b3ed;text-decoration:underline}
.cm-link:hover{color:#90cdf4}
.cm-device-card{background:#2d3748;border:1px solid rgba(66,153,225,.3);border-radius:8px;padding:16px}
.cm-device-code{font-size:24px;font-family:monospace;font-weight:700;color:#fff;text-align:center;margin:8px 0}
.cm-mb-0{margin-bottom:0}
.cm-mb-1{margin-bottom:4px}
.cm-mb-2{margin-bottom:8px}
.cm-mb-3{margin-bottom:12px}
.cm-mt-1{margin-top:4px}
.cm-mt-2{margin-top:8px}
.cm-mt-3{margin-top:12px}
.cm-clickable{cursor:pointer}
.cm-flex1{flex:1}
.cm-text-sm{font-size:13px}
.cm-text-xs{font-size:11px}
.cm-fw-500{font-weight:500}
.cm-input-narrow{width:120px}
.cm-input-mono{flex:1;font-family:monospace;font-size:12px}
.cm-detail-label{color:#718096}
.cm-gap-sm{gap:4px}
.hidden{display:none!important}
`;function B(e,t,n,o){return`<div class="${s.col}">
    <label class="${s.row} ${s.clickable}">
        <input type="checkbox" id="${e}" class="${s.checkbox}" ${n?"checked":""}>
        <span class="${s.labelBold}">${t}</span>
    </label>
    ${o?`<span class="${s.muted}">${o}</span>`:""}
</div>`}function Z(e,t,n,o,a,i){const c=o.map((r,d)=>`<option value="${r}" ${r===n?"selected":""}>${a[d]}</option>`).join("");return`<div class="${s.col}">
        <label class="${s.label}" for="${e}">${t}</label>
        <select id="${e}" class="${s.select}">${c}</select>
        ${i?`<span class="${s.muted}">${i}</span>`:""}
    </div>`}function $t(e,t,n,o){return`<div class="${s.col}">
        <label class="${s.label}" for="${e}">${t}</label>
        <input type="number" id="${e}" class="${s.input} ${s.inputNarrow}" value="${n}" min="0">
        ${`<span class="${s.muted}">${o}</span>`}
    </div>`}function ke(e,t,n,o){const a=o?` placeholder="${o}"`:"";return`<div class="${s.col}">
        <label class="${s.label}" for="${e}">${t}</label>
        <input type="text" id="${e}" class="${s.input}" value="${n}"${a}>
    </div>`}function wt(e){return e==="enabled"?`<span class="${s.badge} ${s.badgeGreen}">enabled</span>`:e==="disabled"?`<span class="${s.badge} ${s.badgeRed}">disabled</span>`:`<span class="${s.badge} ${s.badgeGray}">${e}</span>`}function yt(e){const t=!!e.githubToken,n=t?s.success:s.error,o=t?"인증됨":"미인증";return`<div class="${s.card}">
        <div class="${s.cardTitle}">Token</div>
        <div class="${s.row} ${s.mb2}">
            <input type="password" id="token-input" class="${s.input} ${s.flex1}"
                placeholder="GitHub Token (ghu_xxx)" value="${e.githubToken}">
            <button id="toggle-token" class="${s.btnGhost}" title="토큰 표시/숨김">👁</button>
            <button id="save-token" class="${s.btn}">저장</button>
            <button id="gen-token" class="${s.btn}">토큰 생성</button>
        </div>
        <div class="${s.rowBetween}">
            <span class="${n} ${s.textSm}">상태: ${o}</span>
        </div>
        <div id="device-flow" class="${s.mt3} hidden">
            <div class="${s.deviceCard}">
                <div class="${s.textSm} ${s.mb2}">아래 코드를 입력하세요:</div>
                <div id="device-code" class="cm-device-code"></div>
                <div class="${s.textSm}">
                    <a id="device-link" href="#" target="_blank" class="${s.link}"></a>
                </div>
                <div id="device-status" class="${s.muted} ${s.mt2}"></div>
                <button id="device-confirm" class="${s.btn} ${s.mt2} hidden">인증 확인</button>
            </div>
        </div>
    </div>`}function kt(e){if(!e)return`<div class="${s.card}">
            <div class="${s.rowBetween}">
                <div class="${s.cardTitle}">User Info</div>
                <button id="refresh-user" class="${s.btnGhost}" title="유저 정보 새로고침">🔄</button>
            </div>
            <div class="${s.muted}">토큰을 설정하면 유저 정보가 표시됩니다.</div>
        </div>`;const t=e.quota_snapshots?.premium_interactions;let n="";if(t){const o=t.entitlement-t.remaining,a=t.entitlement>0?(o/t.entitlement*100).toFixed(1):"0";n=`
            <div class="${s.mt2}">
                <div class="${s.rowBetween} ${s.textSm} ${s.mb1}">
                    <span>Premium: ${o}/${t.entitlement}</span>
                    <span>${a}%</span>
                </div>
                <div class="${s.progressBar}">
                    <div class="${s.progressFill}" data-pct="${a}"></div>
                </div>
            </div>`}return`<div class="${s.card}">
        <div class="${s.rowBetween}">
            <div class="${s.cardTitle}">User Info</div>
            <button id="refresh-user" class="${s.btnGhost}">갱신</button>
        </div>
        <div class="${s.row} ${s.textSm}">
            <span class="${s.label}">유저:</span>
            <span class="${s.value} ${s.fw500}">${e.login}</span>
            <span class="${s.muted}">|</span>
            <span class="${s.label}">플랜:</span>
            <span class="${s.value}">${e.copilot_plan}</span>
            <span class="${s.muted}">|</span>
            <span class="${s.label}">리셋:</span>
            <span class="${s.value}">${new Date(e.quota_reset_date_utc).toLocaleString("sv-SE")??"N/A"}</span>
        </div>
        ${n}
    </div>`}function xt(e){return`<div class="${s.card}">
        <div class="${s.cardTitle}">Settings</div>
        <div class="${s.grid2} ${s.mb2}">
            ${B("cfg-streaming","스트리밍 사용",e.streaming,"응답을 실시간으로 받아옵니다. 직업 요청을 해야 실시간으로 보여줄 수 있습니다.")}
            ${B("cfg-native-fetch","직접 요청 사용",e.nativeFetch,"CORS 문제로 환경에 따라 작동하지 않을 수 있습니다.")}
            ${B("cfg-show-thinking","사고 과정 보여주기",e.showThinking,"스트리밍 중 사고 과정도 함께 출력합니다.")}
            ${B("cfg-decoupled","한 번에 출력",e.decoupledStreaming,"모든 스트리밍이 끝나면 한 번에 출력합니다.")}
        </div>
        <div class="${s.grid2}">
            ${Z("cfg-claude-format","Claude 요청 방식",e.claudeFormat,["anthropic","openai"],["Anthropic 방식","OpenAI 방식"],"Anthropic 방식은 적응형 사고가 가능합니다.")}
            ${Z("cfg-thinking-mode","추론 노력",e.thinkingMode,["off","low","medium","high","max"],["사용 안 함","최소 (Low)","균형 (Medium)","높음 (High)","최대 (Max, Opus 전용)"],"Sonnet/Opus 4.6+ 에서 적응형 사고 옵션으로 적용되며, GPT-5 시리즈에서 추론 노력으로 적용됩니다.")}
        </div>
        <div class="${s.grid2}">
            ${Z("cfg-verbosity","OpenAI 출력 제어",e.verbosity,["","low","medium","high"],["사용 안 함","짧게 (Low)","보통 (Medium)","길게 (High)"],"GPT 시리즈에서 출력의 양을 조절합니다.")}
            ${$t("cfg-thinking-budget","추론 토큰",e.thinkingBudget,"적응형 사고를 사용하지 않을 때 설정되는 추론 토큰입니다. 0을 입력하면 추론이 비활성화됩니다.")}
        </div>
    </div>`}function _t(e){return`<div class="${s.card}">
        <div class="${s.cardTitle}">Version</div>
        <div class="${s.grid2} ${s.mb2}">
            ${ke("cfg-vscode-version","VS Code 버전",e.vscodeVersion,E)}
            ${ke("cfg-chat-version","Copilot Chat 버전",e.chatVersion,ie)}
        </div>
        <div class="${s.row} ${s.mt1} ${s.textXs}">
            <span class="${s.muted}">최신 버전 확인:</span>
            <a href="https://code.visualstudio.com/updates/" target="_blank" class="${s.link}">VS Code</a>
            <span class="${s.muted}">|</span>
            <a href="https://github.com/microsoft/vscode-copilot-chat/releases/latest" target="_blank" class="${s.link}">Copilot Chat</a>
        </div>
    </div>`}function It(e){return`<div class="${s.card}">
        <div class="${s.cardTitle}">Machine ID</div>
        <div class="${s.row}">
            <input type="text" id="machine-id" class="${s.input} ${s.inputMono}" value="${e}">
            <button id="regen-machine-id" class="${s.btnGhost}">재생성</button>
        </div>
    </div>`}function St(e){const t=[];return e.inRemote&&t.push(`<span class="${s.badge} ${s.badgeGray}" title="원격 URL">R</span>`),e.inGithub&&t.push(`<span class="${s.badge} ${s.badgeGreen}" title="GitHub API">G</span>`),!e.inRemote&&!e.inGithub&&t.push(`<span class="${s.badge} ${s.badgeYellow}" title="캐시에만 존재 (불일치)">불일치</span>`),e.hidden&&t.push(`<span class="${s.badge} ${s.badgeRed}" title="숨김 처리됨">숨김</span>`),t.join(" ")}function Tt(e,t){const n=e.model,o=n.capabilities?.limits,a=n.capabilities?.supports,i=[];a?.adaptive_thinking&&i.push("thinking"),a?.vision&&i.push("vision"),a?.tool_calls&&i.push("tools"),a?.structured_outputs&&i.push("structured");const c=n.policy?.state??"unknown",r=e.hidden?" cm-model-hidden":"",d=e.hidden?"표시":"숨김",u=e.hidden?"프로바이더에 표시합니다":"프로바이더에서 숨깁니다",l=t.has(n.name)&&n.version?` (${n.version})`:"";return`<div class="${s.modelItem}${r}" data-model-id="${n.id}">
        <div class="${s.rowBetween}">
            <span class="cm-model-name">▸ ${n.name}${l}</span>
            <span class="${s.row} ${s.gapSm}">
                ${St(e)}
                ${wt(c)}
                <button class="cm-btn-hide" data-hide-id="${n.id}" title="${u}">${d}</button>
            </span>
        </div>
        <div class="${s.modelDetail} hidden" data-detail="${n.id}">
            <div><span class="${s.detailLabel}">ID:</span> ${n.id}</div>
            <div><span class="${s.detailLabel}">Max Input:</span> ${o?.max_prompt_tokens?.toLocaleString()??"N/A"} | <span class="${s.detailLabel}">Max Output:</span> ${o?.max_output_tokens?.toLocaleString()??"N/A"}</div>
            ${i.length?`<div><span class="${s.detailLabel}">Features:</span> ${i.join(", ")}</div>`:""}
            ${n.preview?`<div><span class="${s.warning}">Preview</span></div>`:""}
            <div><span class="${s.detailLabel}">Endpoints:</span> ${(n.supported_endpoints??[]).join(", ")}</div>
        </div>
    </div>`}function Et(e){const t=new Map;for(const u of e){const l=u.model.vendor||"Other";t.has(l)||t.set(l,[]),t.get(l).push(u)}const n=new Map;for(const u of e)n.set(u.model.name,(n.get(u.model.name)??0)+1);const o=new Set;for(const[u,l]of n)l>1&&o.add(u);const a=e.filter(u=>!u.hidden).length,i=e.length-a,c=e.filter(u=>!u.inRemote&&!u.inGithub).length,r=[`총 ${e.length}개`];i>0&&r.push(`${i}개 숨김`),c>0&&r.push(`${c}개 불일치`);let d="";for(const[u,l]of t){const g=l.map(te=>Tt(te,o)).join(""),b=l.filter(te=>te.hidden).length,Nt=b>0?`${u} (${l.length}, ${b}개 숨김)`:`${u} (${l.length})`;d+=`
            <div class="${s.mb2}">
                <div class="${s.accordionHeader}" data-vendor="${u}">
                    <span class="${s.textSm} ${s.fw500}">
                        <span class="vendor-chevron ${s.chevron}">▸</span>
                        ${Nt}
                    </span>
                </div>
                <div class="${s.accordionContent} hidden" data-vendor-content="${u}">
                    ${g}
                </div>
            </div>`}return`<div class="${s.card}">
        <div class="${s.rowBetween} ${s.mb2}">
            <div class="${s.cardTitle} ${s.mb0}">Models (${r.join(" · ")})</div>
            <div class="${s.row}">
                <button id="reset-models" class="${s.btnDanger}">초기화</button>
                <button id="refresh-models" class="${s.btn}">새로고침</button>
            </div>
        </div>
        ${e.length===0?`<div class="${s.muted}">모델이 없습니다. 새로고침하세요.</div>`:d}
    </div>`}function xe(e){return`<div class="${s.container}">
    <div class="${s.header}">
        <h1 class="${s.headerTitle}">${I} v${Te} <span class="${s.muted}">by rsyumi</span></h1>
        <button id="close-ui" class="${s.btnClose}">&times;</button>
    </div>
    ${yt(e.config)}
    ${kt(e.userInfo)}
    ${xt(e.config)}
    ${_t(e.config)}
    ${It(e.config.machineId)}
    ${Et(e.modelStates)}
</div>`}const h=S("UI");let w;function f(e){return document.getElementById(e)}function _e(e){w=e,f("close-ui")?.addEventListener("click",()=>{m.hideContainer()}),f("toggle-token")?.addEventListener("click",()=>{const t=f("token-input");t&&(t.type=t.type==="password"?"text":"password")}),f("save-token")?.addEventListener("click",async()=>{const t=f("token-input");t&&(await $(p.GITHUB_TOKEN,t.value.trim()),h.info("토큰 저장됨"),await Se())}),f("gen-token")?.addEventListener("click",Mt),U("cfg-streaming",p.STREAMING),U("cfg-native-fetch",p.NATIVE_FETCH),U("cfg-show-thinking",p.SHOW_THINKING),U("cfg-decoupled",p.DECOUPLED_STREAMING),ee("cfg-claude-format",p.CLAUDE_FORMAT),ee("cfg-thinking-mode",p.THINKING_MODE),ee("cfg-verbosity",p.VERBOSITY),Ie("cfg-vscode-version",p.VSCODE_VERSION),Ie("cfg-chat-version",p.CHAT_VERSION),f("cfg-thinking-budget")?.addEventListener("change",async t=>{const n=parseInt(t.target.value)||0;await $(p.THINKING_BUDGET,n),h.info("Thinking budget 변경",{value:n})}),f("regen-machine-id")?.addEventListener("click",async()=>{const t=Array.from({length:65},()=>Math.floor(Math.random()*16).toString(16)).join(""),n=f("machine-id");n&&(n.value=t),await $(p.MACHINE_ID,t);try{await m.safeLocalStorage.setItem("copilot_machine_id",t)}catch{}h.info("Machine ID 재생성")}),f("machine-id")?.addEventListener("change",async t=>{const n=t.target.value.trim();if(n){await $(p.MACHINE_ID,n);try{await m.safeLocalStorage.setItem("copilot_machine_id",n)}catch{}h.info("Machine ID 변경")}}),f("refresh-user")?.addEventListener("click",async()=>{const t=f("refresh-user");t&&(t.disabled=!0,t.textContent="로딩...");try{const n=await _();if(n.githubToken){const o=await P(n.githubToken);w.userInfo=o,h.info("유저 정보 새로고침 완료")}await A()}catch(n){h.error("유저 정보 새로고침 실패",n)}finally{t&&(t.disabled=!1,t.textContent="갱신")}}),f("refresh-models")?.addEventListener("click",async()=>{const t=f("refresh-models");t&&(t.disabled=!0,t.textContent="로딩...");try{const n=await _(),{models:o,remoteIds:a,githubIds:i}=await Q(n.githubToken||void 0);w.modelStates=await H(o,a,i),h.info("모델 새로고침 완료",{count:o.length}),await A()}catch(n){h.error("모델 새로고침 실패",n)}finally{t&&(t.disabled=!1,t.textContent="새로고침")}}),f("reset-models")?.addEventListener("click",async()=>{const t=f("reset-models");t&&(t.disabled=!0,t.textContent="초기화 중...");try{await mt();const n=await _(),{models:o,remoteIds:a,githubIds:i}=await Q(n.githubToken||void 0);w.modelStates=await H(o,a,i),h.info("모델 초기화 및 재로드 완료",{count:o.length}),await A()}catch(n){h.error("모델 초기화 실패",n)}finally{t&&(t.disabled=!1,t.textContent="초기화")}}),document.querySelectorAll("[data-vendor]").forEach(t=>{t.addEventListener("click",()=>{const n=t.getAttribute("data-vendor"),o=document.querySelector(`[data-vendor-content="${n}"]`),a=t.querySelector(".vendor-chevron");o&&(o.classList.toggle("hidden"),a&&(a.textContent=o.classList.contains("hidden")?"▸":"▾"))})}),document.querySelectorAll("[data-model-id]").forEach(t=>{t.addEventListener("click",n=>{if(n.target.closest("[data-hide-id]"))return;const o=t.getAttribute("data-model-id"),a=document.querySelector(`[data-detail="${o}"]`);a&&a.classList.toggle("hidden")})}),document.querySelectorAll("[data-hide-id]").forEach(t=>{t.addEventListener("click",async n=>{n.stopPropagation();const o=t.getAttribute("data-hide-id"),a=await rt(o);h.info(`모델 ${a?"숨김":"표시"}: ${o}`),w.modelStates=await ye(),await A()})}),document.querySelectorAll("[data-pct]").forEach(t=>{t.style.width=`${t.dataset.pct}%`})}function U(e,t){f(e)?.addEventListener("change",async n=>{const o=n.target.checked;await $(t,o),h.info(`설정 변경: ${t} = ${o}`)})}function ee(e,t){f(e)?.addEventListener("change",async n=>{const o=n.target.value;await $(t,o),h.info(`설정 변경: ${t} = ${o}`)})}function Ie(e,t){f(e)?.addEventListener("change",async n=>{const o=n.target.value.trim();await $(t,o),h.info(`설정 변경: ${t} = ${o}`)})}async function A(){try{w.config=await _()}catch(e){h.warn("설정 재로드 실패, 기존 값 사용",e)}document.body.innerHTML="",document.body.innerHTML=xe(w),_e(w)}async function Mt(){const e=f("device-flow"),t=f("device-status");if(!(!e||!t))try{h.info("Device Flow 시작"),e.classList.remove("hidden"),t.textContent="코드 생성 중...";const n=await Re(),o=f("device-code"),a=f("device-link"),i=f("device-confirm");o&&(o.textContent=n.user_code),a&&(a.href=n.verification_uri,a.textContent=n.verification_uri),t.textContent="위 링크에서 코드를 입력한 후 아래 버튼을 눌러주세요.",i&&(i.classList.remove("hidden"),i.onclick=async()=>{i.disabled=!0,i.textContent="확인 중...";try{const c=await Ge(n.device_code),r=f("token-input");r&&(r.value=c),await $(p.GITHUB_TOKEN,c),t.textContent="✓ 인증 완료!",t.className="cm-success cm-text-xs cm-mt-2",i.classList.add("hidden"),h.info("Device Flow 인증 완료"),setTimeout(()=>Se(),1500)}catch(c){const r=c instanceof Error?c.message:String(c);r.includes("authorization_pending")?t.textContent="아직 인증이 완료되지 않았습니다. 코드를 입력한 후 다시 시도하세요.":(t.textContent=`오류: ${r}`,t.className="cm-error cm-text-xs cm-mt-2")}finally{i.disabled=!1,i.textContent="인증 확인"}})}catch(n){h.error("Device Flow 실패",n),t&&(t.textContent=`오류: ${n instanceof Error?n.message:String(n)}`,t.className="cm-error cm-text-xs cm-mt-2")}}async function Se(){try{const e=await _();if(w.config=e,e.githubToken)try{const t=await P(e.githubToken);w.userInfo=t}catch(t){h.warn("유저 정보 로드 실패",t)}await A()}catch(e){h.error("UI 새로고침 실패",e)}}const C=S("UI");function At(){m.registerSetting("Copilot Manager",Ct,"<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 2.5 24 19' fill='currentColor'><path d='M19.245 5.364c1.322 1.36 1.877 3.216 2.11 5.817.622 0 1.2.135 1.592.654l.73.964c.21.278.323.61.323.955v2.62c0 .339-.173.669-.453.868C20.239 19.602 16.157 21.5 12 21.5c-4.6 0-9.205-2.583-11.547-4.258-.28-.2-.452-.53-.453-.868v-2.62c0-.345.113-.679.321-.956l.73-.963c.392-.517.974-.654 1.593-.654l.029-.297c.25-2.446.81-4.213 2.082-5.52 2.461-2.54 5.71-2.851 7.146-2.864h.198c1.436.013 4.685.323 7.146 2.864zm-7.244 4.328c-.284 0-.613.016-.962.05-.123.447-.305.85-.57 1.108-1.05 1.023-2.316 1.18-2.994 1.18-.638 0-1.306-.13-1.851-.464-.516.165-1.012.403-1.044.996a65.882 65.882 0 00-.063 2.884l-.002.48c-.002.563-.005 1.126-.013 1.69.002.326.204.63.51.765 2.482 1.102 4.83 1.657 6.99 1.657 2.156 0 4.504-.555 6.985-1.657a.854.854 0 00.51-.766c.03-1.682.006-3.372-.076-5.053-.031-.596-.528-.83-1.046-.996-.546.333-1.212.464-1.85.464-.677 0-1.942-.157-2.993-1.18-.266-.258-.447-.661-.57-1.108-.32-.032-.64-.049-.96-.05zm-2.525 4.013c.539 0 .976.426.976.95v1.753c0 .525-.437.95-.976.95a.964.964 0 01-.976-.95v-1.752c0-.525.437-.951.976-.951zm5 0c.539 0 .976.426.976.95v1.753c0 .525-.437.95-.976.95a.964.964 0 01-.976-.95v-1.752c0-.525.437-.951.976-.951zM7.635 5.087c-1.05.102-1.935.438-2.385.906-.975 1.037-.765 3.668-.21 4.224.405.394 1.17.657 1.995.657h.09c.649-.013 1.785-.176 2.73-1.11.435-.41.705-1.433.675-2.47-.03-.834-.27-1.52-.63-1.813-.39-.336-1.275-.482-2.265-.394zm6.465.394c-.36.292-.6.98-.63 1.813-.03 1.037.24 2.06.675 2.47.968.957 2.136 1.104 2.776 1.11h.044c.825 0 1.59-.263 1.995-.657.555-.556.765-3.187-.21-4.224-.45-.468-1.335-.804-2.385-.906-.99-.088-1.875.058-2.265.394zM12 7.615c-.24 0-.525.015-.84.044.03.16.045.336.06.526l-.001.159a2.94 2.94 0 01-.014.25c.225-.022.425-.027.612-.028h.366c.187 0 .387.006.612.028-.015-.146-.015-.277-.015-.409.015-.19.03-.365.06-.526a9.29 9.29 0 00-.84-.044z'></path></svg>","html"),C.info("UI 등록 완료")}async function Ct(){try{C.info("UI 열기");const e=await _(),t=await ye();let n=null;if(e.githubToken)try{n=await P(e.githubToken)}catch(i){C.warn("유저 정보 로드 실패 (UI 열기)",i)}const o={config:e,userInfo:n,modelStates:t};await m.showContainer("fullscreen");const a=new CSSStyleSheet;a.replaceSync(vt),document.adoptedStyleSheets=[a],document.body.innerHTML=xe(o),_e(o),C.info("UI 렌더링 완료")}catch(e){C.error("UI 열기 실패",e)}}(async()=>{const e=S("Init");try{const t=await Ce();De(t),e.info("Machine ID 준비 완료");const n=await _();e.info("설정 로드 완료",{streaming:n.streaming,nativeFetch:n.nativeFetch});const o=await pe();e.info("Bridge 스트림 지원",{supported:o});const{models:a,remoteIds:i,githubIds:c}=await Q(n.githubToken||void 0),r=await H(a,i,c);e.info("모델 로드 완료",{total:a.length,remote:i.size,github:c.size,hidden:r.filter(d=>d.hidden).length}),a.length>0&&await bt(a),At(),e.info("초기화 완료")}catch(t){e.error("초기화 실패",t)}})()})();
