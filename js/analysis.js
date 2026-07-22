window.RIDAnalysis=(()=>{function parseDate(v){if(v instanceof Date&&!isNaN(v))return v;if(typeof v==="number"){const p=XLSX.SSF.parse_date_code(v);if(p)return new Date(p.y,p.m-1,p.d,p.H,p.M,p.S||0)}const d=new Date(v);return isNaN(d)?null:d}function normalizeRows(rows){return rows.map((r,i)=>({sr:Number(r["Sr. No."]??r["Sr No"]??r.Serial??i+1),number:Number(r["Draw No."]??r["Draw No"]??r.Number??r.Result),time:parseDate(r["Draw Time"]??r.Time??r.Date)})).filter(r=>Number.isInteger(r.number)&&r.number>=0&&r.number<=36)}function analyzeSet(rows,numbers){const set=new Set(numbers);let hits=0,currentMiss=0,longestMiss=0,currentHit=0,longestHit=0;const gaps=[];for(const r of rows){if(set.has(r.number)){hits++;if(currentMiss>0)gaps.push(currentMiss);currentMiss=0;currentHit++;longestHit=Math.max(longestHit,currentHit)}else{currentMiss++;longestMiss=Math.max(longestMiss,currentMiss);currentHit=0}}const misses=rows.length-hits,hitRate=rows.length?hits/rows.length*100:0,avgGap=gaps.length?gaps.reduce((a,b)=>a+b,0)/gaps.length:0;return{hits,misses,hitRate,longestMiss,currentMiss,longestHit,avgGap}}function hourly(rows,numbers){const set=new Set(numbers);return Array.from({length:24},(_,hour)=>{const bucket=rows.filter(r=>r.time&&r.time.getHours()===hour);const hits=bucket.filter(r=>set.has(r.number)).length;return{hour,spins:bucket.length,hits,rate:bucket.length?hits/bucket.length*100:0}})}function frequency(rows){const f=Array(37).fill(0);rows.forEach(r=>f[r.number]++);return f}function bestHour(rows){return rows.reduce((best,r)=>r.spins&&r.rate>best.rate?r:best,{hour:null,rate:-1,hits:0,spins:0})}function analyzeAll(rows,custom=[]){const a=analyzeSet(rows,RID_STRATEGIES["Apne 16"]),b=analyzeSet(rows,RID_STRATEGIES["Top 16"]),c=analyzeSet(rows,RID_STRATEGIES["Top 21"]),customStats=analyzeSet(rows,custom),hourlyA=hourly(rows,RID_STRATEGIES["Apne 16"]),hourlyB=hourly(rows,RID_STRATEGIES["Top 16"]),hourlyC=hourly(rows,RID_STRATEGIES["Top 21"]),hourlyCustom=hourly(rows,custom),combinedNumbers=[...new Set([...RID_STRATEGIES["Apne 16"],...RID_STRATEGIES["Top 16"],...RID_STRATEGIES["Top 21"]])],combined=analyzeSet(rows,combinedNumbers),hourlyCombined=hourly(rows,combinedNumbers);return{total:rows.length,a,b,c,combined,custom:customStats,hourlyA,hourlyB,hourlyC,hourlyCombined,hourlyCustom,frequency:frequency(rows),bestHour:bestHour(hourlyC)}}function orderChronologically(rows){
  return rows.map((row,index)=>({row,index})).sort((a,b)=>{
    const at=a.row.time instanceof Date&&!isNaN(a.row.time)?a.row.time.getTime():Number.MAX_SAFE_INTEGER;
    const bt=b.row.time instanceof Date&&!isNaN(b.row.time)?b.row.time.getTime():Number.MAX_SAFE_INTEGER;
    return at-bt||(a.row.sr||a.index)-(b.row.sr||b.index)||a.index-b.index;
  }).map(item=>item.row);
}
function followingNumberRelationships(rows,selectedNumber){
  if(!Number.isInteger(selectedNumber)||selectedNumber<0||selectedNumber>36){
    return{selectedNumber:null,selectedAppearances:0,outgoingTransitions:0,selfTransitions:0,relationships:[]};
  }

  const ordered=orderChronologically(rows);
  const counts=Array(37).fill(0);
  let selectedAppearances=0;
  let outgoingTransitions=0;
  let selfTransitions=0;

  ordered.forEach(row=>{if(row.number===selectedNumber)selectedAppearances++;});

  for(let index=0;index<ordered.length-1;index++){
    if(ordered[index].number!==selectedNumber)continue;
    const nextNumber=ordered[index+1].number;
    if(!Number.isInteger(nextNumber)||nextNumber<0||nextNumber>36)continue;
    outgoingTransitions++;
    counts[nextNumber]++;
    if(nextNumber===selectedNumber)selfTransitions++;
  }

  const relationships=Array.from({length:37},(_,number)=>number)
    .map(number=>({
      number,
      count:counts[number],
      rate:outgoingTransitions?(counts[number]/outgoingTransitions)*100:0
    }))
    .sort((a,b)=>b.count-a.count||a.number-b.number);

  return{selectedNumber,selectedAppearances,outgoingTransitions,selfTransitions,relationships};
}
function recommendNextSix(rows, limit=16){
  const valid=rows.filter(r=>r.time instanceof Date&&!isNaN(r.time));
  if(!valid.length)return{numbers:[],windowLabel:"No valid timestamps",details:[]};

  const latestTimestamp=valid.reduce((maximum,row)=>Math.max(maximum,row.time.getTime()),-Infinity);
  const latest=new Date(latestTimestamp);
  const start=new Date(latest.getTime()-6*60*60*1000);
  const recent=valid.filter(r=>r.time>start&&r.time<=latest);

  const fullFreq=frequency(rows);
  const recentFreq=frequency(recent);
  const recentTotal=Math.max(recent.length,1);
  const fullTotal=Math.max(rows.length,1);

  const ranked=Array.from({length:36},(_,i)=>i+1).map(number=>{
    const recentRate=recentFreq[number]/recentTotal;
    const fullRate=fullFreq[number]/fullTotal;
    const score=(recentRate*0.75)+(fullRate*0.25);
    return{
      number,
      recentHits:recentFreq[number],
      fullHits:fullFreq[number],
      recentRate,
      fullRate,
      score
    };
  }).sort((a,b)=>b.score-a.score||b.recentHits-a.recentHits||b.fullHits-a.fullHits||a.number-b.number);

  return{
    numbers:ranked.slice(0,limit).map(x=>x.number),
    windowLabel:`${start.toLocaleString()} → ${latest.toLocaleString()}`,
    recentSpins:recent.length,
    details:ranked.slice(0,limit)
  };
}return{normalizeRows,analyzeSet,hourly,frequency,bestHour,analyzeAll,followingNumberRelationships,recommendNextSix}})();
