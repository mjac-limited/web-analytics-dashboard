import { useState, useRef, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const dailySessionData = [
  { date:"6 Feb",  monzo:382000, web:84200, community:48000, api:12800 },{ date:"7 Feb",  monzo:365000, web:80400, community:45800, api:12200 },
  { date:"8 Feb",  monzo:378000, web:83100, community:47200, api:12600 },{ date:"9 Feb",  monzo:341000, web:75100, community:44600, api:11400 },
  { date:"10 Feb", monzo:395000, web:86900, community:49100, api:13200 },{ date:"12 Feb", monzo:418000, web:92000, community:52400, api:14000 },
  { date:"14 Feb", monzo:431000, web:94900, community:54800, api:14400 },{ date:"16 Feb", monzo:408000, web:89800, community:51200, api:13600 },
  { date:"18 Feb", monzo:447000, web:98400, community:57300, api:14900 },{ date:"20 Feb", monzo:422000, web:92900, community:53100, api:14100 },
  { date:"22 Feb", monzo:468000, web:103000, community:58700, api:15600 },{ date:"24 Feb", monzo:502000, web:110400, community:62100, api:16800 },
  { date:"26 Feb", monzo:489000, web:107600, community:60400, api:16300 },{ date:"28 Feb", monzo:461000, web:101400, community:57800, api:15400 },
  { date:"1 Mar",  monzo:443000, web:97500, community:55900, api:14800 },{ date:"3 Mar",  monzo:458000, web:100800, community:58200, api:15300 },
  { date:"5 Mar",  monzo:521000, web:114600, community:64700, api:17400 },{ date:"7 Mar",  monzo:476000, web:104700, community:59300, api:15900 },
];

const dailyUsersData = dailySessionData.map(d=>({date:d.date, monzo:Math.round(d.monzo*0.723), web:Math.round(d.web*0.783), community:Math.round(d.community*0.636), api:Math.round(d.api*0.703)}));
const dailyViewsData = dailySessionData.map(d=>({date:d.date, monzo:Math.round(d.monzo*1.821), web:Math.round(d.web*1.900), community:Math.round(d.community*1.824), api:Math.round(d.api*2.094)}));
// Bounce rate & duration: realistic daily values (small variation around property averages)
// These are percentages/seconds, NOT scaled from session counts
const _dates = dailySessionData.map(d=>d.date);
const dailyBounceData = _dates.map((date,i) => ({
  date,
  monzo:     parseFloat((34.8 + Math.sin(i*1.3)*1.8 + Math.cos(i*0.9)*0.9).toFixed(1)),
  web:       parseFloat((16.4 + Math.sin(i*1.0)*1.0 + Math.cos(i*0.8)*0.5).toFixed(1)),
  community: parseFloat((26.2 + Math.sin(i*1.1)*1.4 + Math.cos(i*0.7)*0.7).toFixed(1)),
  api:       parseFloat((24.8 + Math.sin(i*0.8)*1.2 + Math.cos(i*0.6)*0.6).toFixed(1)),
}));
const dailyDurationData = _dates.map((date,i) => ({
  date,
  monzo:     Math.round(238 + Math.sin(i*1.2)*18 + Math.cos(i*0.8)*9),
  web:       Math.round(312 + Math.sin(i*0.9)*24 + Math.cos(i*0.7)*12),
  community: Math.round(268 + Math.sin(i*1.0)*22 + Math.cos(i*0.6)*11),
  api:       Math.round(374 + Math.sin(i*0.7)*28 + Math.cos(i*0.5)*14),
}));

// Hourly data (24h, today)
const _hours = Array.from({length:24},(_,i)=>i<10?`0${i}:00`:`${i}:00`);
const hourlyData = {
  Sessions:    _hours.map((h,i)=>({date:h, monzo:Math.round(14200+Math.sin(i*0.6)*6800+Math.cos(i*0.3)*3200), web:Math.round(2640+Math.sin(i*0.6)*1260+Math.cos(i*0.3)*590), community:Math.round(1800+Math.sin(i*0.6)*820+Math.cos(i*0.3)*380), api:Math.round(880+Math.sin(i*0.6)*420+Math.cos(i*0.3)*200)})),
  Users:       _hours.map((h,i)=>({date:h, monzo:Math.round(10560+Math.sin(i*0.6)*5000+Math.cos(i*0.3)*2400), web:Math.round(2060+Math.sin(i*0.6)*980+Math.cos(i*0.3)*460), community:Math.round(1140+Math.sin(i*0.6)*520+Math.cos(i*0.3)*240), api:Math.round(620+Math.sin(i*0.6)*296+Math.cos(i*0.3)*140)})),
  Views:       _hours.map((h,i)=>({date:h, monzo:Math.round(25900+Math.sin(i*0.6)*12400+Math.cos(i*0.3)*5800), web:Math.round(5020+Math.sin(i*0.6)*2400+Math.cos(i*0.3)*1120), community:Math.round(3280+Math.sin(i*0.6)*1500+Math.cos(i*0.3)*700), api:Math.round(1840+Math.sin(i*0.6)*880+Math.cos(i*0.3)*420)})),
  "Avg Duration": _hours.map((h,i)=>({date:h, monzo:Math.round(238+Math.sin(i*0.9)*20+Math.cos(i*0.5)*10), web:Math.round(312+Math.sin(i*0.8)*26+Math.cos(i*0.4)*13), community:Math.round(268+Math.sin(i*0.7)*24+Math.cos(i*0.4)*12), api:Math.round(374+Math.sin(i*0.6)*32+Math.cos(i*0.3)*16)})),
  "Bounce Rate":  _hours.map((h,i)=>({date:h, monzo:parseFloat((34.8+Math.sin(i*0.8)*2.1+Math.cos(i*0.5)*1.0).toFixed(1)), web:parseFloat((16.4+Math.sin(i*0.7)*1.2+Math.cos(i*0.4)*0.6).toFixed(1)), community:parseFloat((26.2+Math.sin(i*0.6)*1.6+Math.cos(i*0.4)*0.8).toFixed(1)), api:parseFloat((24.8+Math.sin(i*0.5)*1.4+Math.cos(i*0.3)*0.7).toFixed(1))})),
};

// Weekly data (last 12 weeks)
const _weeks = Array.from({length:12},(_,i)=>`W${i+1}`);
const weeklyData = {
  Sessions:    _weeks.map((w,i)=>({date:w, monzo:Math.round(580000+i*18000+Math.sin(i*0.9)*42000), web:Math.round(108000+i*3360+Math.sin(i*0.8)*7800), community:Math.round(72000+i*2200+Math.sin(i*0.8)*5200), api:Math.round(36000+i*1120+Math.sin(i*0.7)*2600)})),
  Users:       _weeks.map((w,i)=>({date:w, monzo:Math.round(432000+i*13400+Math.sin(i*0.9)*31200), web:Math.round(84600+i*2630+Math.sin(i*0.8)*6100), community:Math.round(45800+i*1400+Math.sin(i*0.8)*3300), api:Math.round(25300+i*787+Math.sin(i*0.7)*1830)})),
  Views:       _weeks.map((w,i)=>({date:w, monzo:Math.round(1058000+i*32800+Math.sin(i*0.9)*76400), web:Math.round(205200+i*6370+Math.sin(i*0.8)*14820), community:Math.round(131200+i*4000+Math.sin(i*0.8)*9500), api:Math.round(75400+i*2340+Math.sin(i*0.7)*5450)})),
  "Avg Duration": _weeks.map((w,i)=>({date:w, monzo:Math.round(236+i*0.4+Math.sin(i*0.8)*14), web:Math.round(310+i*0.3+Math.sin(i*0.7)*20), community:Math.round(265+i*0.3+Math.sin(i*0.6)*18), api:Math.round(372+i*0.2+Math.sin(i*0.5)*26)})),
  "Bounce Rate":  _weeks.map((w,i)=>({date:w, monzo:parseFloat((35.4-i*0.06+Math.sin(i*0.8)*1.4).toFixed(1)), web:parseFloat((17.0-i*0.05+Math.sin(i*0.7)*0.8).toFixed(1)), community:parseFloat((26.8-i*0.05+Math.sin(i*0.6)*1.1).toFixed(1)), api:parseFloat((25.4-i*0.05+Math.sin(i*0.5)*1.0).toFixed(1))})),
};

// Monthly data (last 12 months)
const _months = ["Apr '25","May '25","Jun '25","Jul '25","Aug '25","Sep '25","Oct '25","Nov '25","Dec '25","Jan '26","Feb '26","Mar '26"];
const monthlyData = {
  Sessions:    _months.map((m,i)=>({date:m, monzo:Math.round(4420000+i*174000+Math.sin(i*0.7)*220000), web:Math.round(820000+i*32200+Math.sin(i*0.6)*41000), community:Math.round(346000+i*13600+Math.sin(i*0.6)*17200), api:Math.round(274000+i*10760+Math.sin(i*0.5)*13700)})),
  Users:       _months.map((m,i)=>({date:m, monzo:Math.round(3288000+i*129200+Math.sin(i*0.7)*163600), web:Math.round(641600+i*25200+Math.sin(i*0.6)*32080), community:Math.round(219800+i*8640+Math.sin(i*0.6)*10920), api:Math.round(192600+i*7560+Math.sin(i*0.5)*9630)})),
  Views:       _months.map((m,i)=>({date:m, monzo:Math.round(8062000+i*317200+Math.sin(i*0.7)*401200), web:Math.round(1558400+i*61230+Math.sin(i*0.6)*77920), community:Math.round(630800+i*24800+Math.sin(i*0.6)*31350), api:Math.round(573800+i*22540+Math.sin(i*0.5)*28690)})),
  "Avg Duration": _months.map((m,i)=>({date:m, monzo:Math.round(228+i*0.9+Math.sin(i*0.7)*12), web:Math.round(302+i*0.8+Math.sin(i*0.6)*16), community:Math.round(256+i*1.1+Math.sin(i*0.5)*15), api:Math.round(362+i*1.1+Math.sin(i*0.4)*22)})),
  "Bounce Rate":  _months.map((m,i)=>({date:m, monzo:parseFloat((36.8-i*0.2+Math.sin(i*0.7)*1.2).toFixed(1)), web:parseFloat((17.8-i*0.12+Math.sin(i*0.6)*0.7).toFixed(1)), community:parseFloat((27.8-i*0.14+Math.sin(i*0.5)*0.9).toFixed(1)), api:parseFloat((26.2-i*0.13+Math.sin(i*0.4)*0.8).toFixed(1))})),
};

const METRIC_DAILY = { Sessions:dailySessionData, Users:dailyUsersData, Views:dailyViewsData, "Avg Duration":dailyDurationData, "Bounce Rate":dailyBounceData };
const GRANULARITY_DATA = { Hourly:hourlyData, Daily:METRIC_DAILY, Weekly:weeklyData, Monthly:monthlyData };

const yoyData = [
  { month:"Jan", y2024:3820000, y2025:5140000, y2026:6980000 },
  { month:"Feb", y2024:3650000, y2025:4980000, y2026:7210000 },
  { month:"Mar", y2024:4120000, y2025:5390000, y2026:8214300 },
  { month:"Apr", y2024:4380000, y2025:5720000, y2026:null },
  { month:"May", y2024:4510000, y2025:5940000, y2026:null },
  { month:"Jun", y2024:4290000, y2025:5680000, y2026:null },
  { month:"Jul", y2024:4180000, y2025:5510000, y2026:null },
  { month:"Aug", y2024:4640000, y2025:6120000, y2026:null },
  { month:"Sep", y2024:4820000, y2025:6380000, y2026:null },
  { month:"Oct", y2024:5010000, y2025:6740000, y2026:null },
  { month:"Nov", y2024:5280000, y2025:7090000, y2026:null },
  { month:"Dec", y2024:5490000, y2025:7420000, y2026:null },
];

const allTrafficSources = [
  { source:"(direct)",        sessions:4304000, users:3198000, views:7748000, duration:214, bounce:30.8, prevSessions:3821000, prevUsers:2844000, prevViews:6882000, prevDuration:198, prevBounce:33.4 },
  { source:"google",          sessions:430000, users:318000, views:798000,  duration:142, bounce:34.2, prevSessions:395000, prevUsers:290000, prevViews:731000,  prevDuration:138, prevBounce:54.2 },
  { source:"github.com",      sessions:120000, users:89000,  views:224000,  duration:188, bounce:26.4, prevSessions:132000, prevUsers:98000,  prevViews:248000,  prevDuration:195, prevBounce:36.8 },
  { source:"bing",            sessions:60000,  users:44000,  views:108000,  duration:121, bounce:38.8, prevSessions:55000,  prevUsers:40000,  prevViews:99000,   prevDuration:118, prevBounce:58.9 },
  { source:"chatgpt.com",     sessions:30000,  users:22000,  views:55000,   duration:164, bounce:29.8, prevSessions:18000,  prevUsers:13000,  prevViews:33000,   prevDuration:151, prevBounce:46.8 },
  { source:"yandex.ru",       sessions:20000,  users:15000,  views:37000,   duration:98,  bounce:42.4, prevSessions:22000,  prevUsers:16500,  prevViews:41000,   prevDuration:102, prevBounce:59.7 },
  { source:"duckduckgo.com",  sessions:17500,  users:13000,  views:32000,   duration:133, bounce:32.4, prevSessions:15800,  prevUsers:11700,  prevViews:29000,   prevDuration:129, prevBounce:51.3 },
  { source:"linkedin.com",    sessions:12800,  users:9500,   views:23400,   duration:178, bounce:28.2, prevSessions:11200,  prevUsers:8300,   prevViews:20500,   prevDuration:168, prevBounce:44.3 },
  { source:"twitter.com",     sessions:10400,  users:7700,   views:19100,   duration:112, bounce:39.8, prevSessions:11800,  prevUsers:8700,   prevViews:21600,   prevDuration:108, prevBounce:56.9 },
  { source:"reddit.com",      sessions:9100,   users:6700,   views:16700,   duration:147, bounce:31.2, prevSessions:8400,   prevUsers:6200,   prevViews:15400,   prevDuration:143, prevBounce:48.1 },
  { source:"stackoverflow.com",sessions:7800,  users:5800,   views:14300,   duration:196, bounce:22.8, prevSessions:8200,   prevUsers:6100,   prevViews:15000,   prevDuration:201, prevBounce:33.2 },
  { source:"youtube.com",     sessions:5200,   users:3800,   views:9500,    duration:158, bounce:30.4, prevSessions:4600,   prevUsers:3400,   prevViews:8400,    prevDuration:152, prevBounce:47.2 },
];

const allCountryData = [
  { country:"United Kingdom", sessions:6820000, users:5124000, views:12340000, duration:218, bounce:30.4, prevSessions:5614000, prevUsers:4218000, prevViews:10160000, prevDuration:204, prevBounce:50.1 },
  { country:"United States",  sessions:496000,  users:364000,  views:893000,   duration:198, bounce:36.8, prevSessions:402000,  prevUsers:296000,  prevViews:724000,   prevDuration:184, prevBounce:39.2 },
  { country:"Ireland",        sessions:312000,  users:228000,  views:562000,   duration:224, bounce:34.2, prevSessions:248000,  prevUsers:182000,  prevViews:446000,   prevDuration:210, prevBounce:36.8 },
  { country:"Germany",        sessions:188000,  users:138000,  views:338000,   duration:188, bounce:38.4, prevSessions:148000,  prevUsers:109000,  prevViews:266000,   prevDuration:176, prevBounce:59.9 },
  { country:"Australia",      sessions:124000,  users:91000,   views:223000,   duration:202, bounce:34.8, prevSessions:98000,   prevUsers:72000,   prevViews:176000,   prevDuration:189, prevBounce:37.4 },
  { country:"Canada",         sessions:94000,   users:69000,   views:169000,   duration:194, bounce:36.2, prevSessions:74000,   prevUsers:54000,   prevViews:133000,   prevDuration:181, prevBounce:56.8 },
  { country:"France",         sessions:72000,   users:53000,   views:130000,   duration:178, bounce:40.2, prevSessions:58000,   prevUsers:43000,   prevViews:104000,   prevDuration:166, prevBounce:61.2 },
  { country:"Spain",          sessions:58000,   users:43000,   views:104000,   duration:172, bounce:42.4, prevSessions:46000,   prevUsers:34000,   prevViews:83000,    prevDuration:161, prevBounce:63.4 },
  { country:"Netherlands",    sessions:48000,   users:35000,   views:86000,    duration:184, bounce:37.8, prevSessions:38000,   prevUsers:28000,   prevViews:68000,    prevDuration:172, prevBounce:58.4 },
  { country:"Italy",          sessions:42000,   users:31000,   views:76000,    duration:168, bounce:43.8, prevSessions:34000,   prevUsers:25000,   prevViews:61000,    prevDuration:157, prevBounce:64.8 },
  { country:"Sweden",         sessions:38000,   users:28000,   views:68000,    duration:192, bounce:35.4, prevSessions:31000,   prevUsers:23000,   prevViews:56000,    prevDuration:180, prevBounce:55.9 },
  { country:"New Zealand",    sessions:28000,   users:21000,   views:50000,    duration:196, bounce:34.4, prevSessions:22000,   prevUsers:16000,   prevViews:40000,    prevDuration:184, prevBounce:54.6 },
  { country:"United Arab Emirates", sessions:22000, users:16000, views:40000, duration:186, bounce:38.6, prevSessions:17000,  prevUsers:12000,   prevViews:31000,    prevDuration:174, prevBounce:59.8 },
];

// ─── PER-PROPERTY DATA ────────────────────────────────────────────────────────
const PROPERTY_DATA = {
  "All Properties": null, // uses defaults
  "monzo.com": {
    kpi:{ sessions:"6,200,000", sessionsN:6200000, sessionsPrev:5025000, sessChg:"+23.4%",
          users:"4,482,000",   usersN:4482000,   usersPrev:3731000,   usrChg:"+20.1%",
          views:"11,284,000",  viewsN:11284000,  viewsPrev:8869000,   vwChg:"+27.2%",
          dur:"3m 58s", durN:238, durPrev:220, durChg:"+8.2%", durPos:true,
          bounce:"24.2%", bounceN:34.8, bouncePrev:37.2, bounceChg:"-6.5%", bouncePos:true },
    channels:[
      {name:"Organic Search",value:38.2,sessions:2368400,color:"#e4e4e7"},{name:"Direct",value:34.1,sessions:2114200,color:"#e4e4e7"},
      {name:"Referral",value:12.4,sessions:768800,color:"#e4e4e7"},{name:"Organic Social",value:8.8,sessions:545600,color:"#e4e4e7"},
      {name:"Email",value:4.2,sessions:260400,color:"#e4e4e7"},{name:"Organic Video",value:1.8,sessions:111600,color:"#e4e4e7"},
      {name:"Unassigned",value:0.5,sessions:31000,color:"#e4e4e7"}],
    devices:[{name:"Desktop",value:58.2,sessions:3608400,color:"#e4e4e7"},{name:"Mobile",value:40.1,sessions:2486200,color:"#71717a"},{name:"Tablet",value:1.7,sessions:105400,color:"#3f3f46"}],
    newReturn:[{name:"New",value:64.2,sessions:3980400,color:"#e4e4e7"},{name:"Returning",value:35.8,sessions:2219600,color:"#52525b"}],
    events:[{name:"page_view",count:11284000},{name:"session_start",count:6200000},{name:"first_visit",count:3980400},{name:"user_engagement",count:3720000},{name:"click",count:1860000},{name:"scroll",count:1240000}],
    os:[{name:"Windows",value:61},{name:"Mac",value:18},{name:"iOS",value:11},{name:"Android",value:6},{name:"Linux",value:4}],
    browsers:[{name:"Chrome",value:52},{name:"Safari",value:22},{name:"Microsoft Edge",value:16},{name:"Firefox",value:6},{name:"Samsung Internet",value:4}],
    referrers:[{name:"moneysavingexpert.com",visitors:142000},{name:"t.co",visitors:98400},{name:"google.com",visitors:84200},{name:"reddit.com",visitors:61300},{name:"trustpilot.com",visitors:48700},{name:"linkedin.com",visitors:38200},{name:"facebook.com",visitors:29400},{name:"youtube.com",visitors:18600},{name:"bing.com",visitors:14200},{name:"thisismoney.co.uk",visitors:9800}],
    utm:[{name:"utm_source=google",visitors:94800},{name:"utm_campaign=spring_2026",visitors:62400},{name:"utm_source=newsletter",visitors:48200},{name:"utm_source=twitter",visitors:38400},{name:"utm_medium=cpc",visitors:28600},{name:"utm_source=linkedin",visitors:19200}],
    countries:[
      {country:"United Kingdom",sessions:4340000,users:3136000,views:7904000,duration:242,bounce:32.8,prevSessions:3514000,prevUsers:2541000,prevViews:6402000,prevDuration:228,prevBounce:50.4},
      {country:"United States",sessions:496000,users:364000,views:893000,duration:218,bounce:36.2,prevSessions:402000,prevUsers:296000,prevViews:724000,prevDuration:204,prevBounce:38.8},
      {country:"Ireland",sessions:310000,users:228000,views:558000,duration:228,bounce:34.4,prevSessions:248000,prevUsers:182000,prevViews:446000,prevDuration:214,prevBounce:36.8},
      {country:"Germany",sessions:186000,users:138000,views:335000,duration:198,bounce:38.8,prevSessions:148000,prevUsers:110000,prevViews:266000,prevDuration:188,prevBounce:60.1},
      {country:"Australia",sessions:124000,users:91000,views:223000,duration:212,bounce:34.2,prevSessions:98000,prevUsers:72000,prevViews:176000,prevDuration:198,prevBounce:36.8},
    ],
    sources:[
      {source:"google",sessions:2369000,users:1764000,views:4264000,duration:228,bounce:33.8,prevSessions:1921000,prevUsers:1428000,prevViews:3458000,prevDuration:214,prevBounce:53.2},
      {source:"(direct)",sessions:2114000,users:1572000,views:3805000,duration:244,bounce:30.4,prevSessions:1712000,prevUsers:1274000,prevViews:3084000,prevDuration:228,prevBounce:49.1},
      {source:"moneysavingexpert.com",sessions:769000,users:572000,views:1384000,duration:198,bounce:38.4,prevSessions:622000,prevUsers:463000,prevViews:1120000,prevDuration:186,prevBounce:60.4},
      {source:"t.co",sessions:546000,users:406000,views:982000,duration:184,bounce:40.8,prevSessions:442000,prevUsers:330000,prevViews:796000,prevDuration:172,prevBounce:64.8},
      {source:"reddit.com",sessions:310000,users:230000,views:558000,duration:212,bounce:36.8,prevSessions:248000,prevUsers:184000,prevViews:446000,prevDuration:198,prevBounce:58.8},
    ],
    pages:[
      {property:"monzo.com",page:"/",sessions:2847300,users:2193400,views:5182100,bounce:"22.8%",duration:"4m 12s"},
      {property:"monzo.com",page:"/personal-account/",sessions:891200,users:712400,views:1622000,bounce:"26.8%",duration:"3m 48s"},
      {property:"monzo.com",page:"/features/pots/",sessions:743100,users:621800,views:1352400,bounce:"14.8%",duration:"4m 22s"},
      {property:"monzo.com",page:"/features/savings/",sessions:612400,users:498200,views:1114600,bounce:"17.8%",duration:"4m 02s"},
      {property:"monzo.com",page:"/features/investments/",sessions:489300,users:341200,views:890500,bounce:"29.8%",duration:"3m 38s"},
      {property:"monzo.com",page:"/features/instant-notifications/",sessions:421700,users:298400,views:767500,bounce:"24.8%",duration:"3m 54s"},
      {property:"monzo.com",page:"/features/card-controls/",sessions:398200,users:287600,views:724700,bounce:"23.4%",duration:"3m 28s"},
      {property:"monzo.com",page:"/features/budgeting/",sessions:341800,users:241900,views:622100,bounce:"27.2%",duration:"3m 44s"},
      {property:"monzo.com",page:"/features/salary-sorter/",sessions:312400,users:218700,views:568600,bounce:"28.4%",duration:"3m 18s"},
      {property:"monzo.com",page:"/business/",sessions:287600,users:241300,views:523400,bounce:"30.2%",duration:"3m 02s"},
      {property:"monzo.com",page:"/features/split-the-bill/",sessions:264200,users:198400,views:480800,bounce:"31.8%",duration:"2m 58s"},
      {property:"monzo.com",page:"/pricing/",sessions:241800,users:189200,views:440100,bounce:"38.4%",duration:"1m 58s"},
      {property:"monzo.com",page:"/features/travel-abroad/",sessions:218700,users:164200,views:398000,bounce:"26.2%",duration:"3m 22s"},
      {property:"monzo.com",page:"/switch-to-monzo/",sessions:198400,users:161800,views:361100,bounce:"33.8%",duration:"2m 42s"},
      {property:"monzo.com",page:"/features/apple-pay/",sessions:182100,users:148700,views:331400,bounce:"27.8%",duration:"2m 54s"},
      {property:"monzo.com",page:"/about/",sessions:164300,users:128400,views:299000,bounce:"39.8%",duration:"1m 44s"},
      {property:"monzo.com",page:"/features/virtual-cards/",sessions:149800,users:124200,views:272600,bounce:"27.4%",duration:"3m 08s"},
      {property:"monzo.com",page:"/features/connected-cards/",sessions:138200,users:108400,views:251500,bounce:"20.4%",duration:"2m 48s"},
      {property:"monzo.com",page:"/download/",sessions:124700,users:94200,views:227000,bounce:"20.4%",duration:"1m 22s"},
      {property:"monzo.com",page:"/careers/",sessions:118400,users:91800,views:215500,bounce:"26.8%",duration:"2m 18s"},
    ],
    yoy:[
      {month:"Jan",y2024:2980000,y2025:3940000,y2026:5410000},
      {month:"Feb",y2024:2840000,y2025:3820000,y2026:5680000},
      {month:"Mar",y2024:3210000,y2025:4180000,y2026:6200000},
      {month:"Apr",y2024:3420000,y2025:4410000,y2026:null},
      {month:"May",y2024:3510000,y2025:4620000,y2026:null},
      {month:"Jun",y2024:3340000,y2025:4410000,y2026:null},
      {month:"Jul",y2024:3250000,y2025:4280000,y2026:null},
      {month:"Aug",y2024:3610000,y2025:4750000,y2026:null},
      {month:"Sep",y2024:3750000,y2025:4960000,y2026:null},
      {month:"Oct",y2024:3900000,y2025:5240000,y2026:null},
      {month:"Nov",y2024:4110000,y2025:5510000,y2026:null},
      {month:"Dec",y2024:4270000,y2025:5770000,y2026:null},
    ],
  },
  "web.monzo.com": {
    kpi:{ sessions:"1,140,000", sessionsN:1140000, sessionsPrev:965000, sessChg:"+18.1%",
          users:"892,000",   usersN:892000,   usersPrev:758000,   usrChg:"+17.7%",
          views:"2,166,000",  viewsN:2166000,  viewsPrev:1808000,   vwChg:"+19.8%",
          dur:"5m 12s", durN:312, durPrev:278, durChg:"+12.2%", durPos:true,
          bounce:"10.4%", bounceN:16.4, bouncePrev:18.8, bounceChg:"-12.8%", bouncePos:true },
    channels:[
      {name:"Direct",value:72.4,sessions:824800,color:"#e4e4e7"},{name:"Organic Search",value:12.8,sessions:145900,color:"#e4e4e7"},
      {name:"Referral",value:9.2,sessions:104900,color:"#e4e4e7"},{name:"Email",value:4.1,sessions:46700,color:"#e4e4e7"},
      {name:"Organic Social",value:1.1,sessions:12500,color:"#e4e4e7"},{name:"Unassigned",value:0.4,sessions:4600,color:"#e4e4e7"},
      {name:"Organic Video",value:0.0,sessions:600,color:"#e4e4e7"}],
    devices:[{name:"Desktop",value:52.4,sessions:597400,color:"#e4e4e7"},{name:"Mobile",value:45.8,sessions:522100,color:"#71717a"},{name:"Tablet",value:1.8,sessions:20500,color:"#3f3f46"}],
    newReturn:[{name:"New",value:22.4,sessions:255400,color:"#e4e4e7"},{name:"Returning",value:77.6,sessions:884600,color:"#52525b"}],
    events:[{name:"page_view",count:2166000},{name:"session_start",count:1140000},{name:"click",count:892000},{name:"user_engagement",count:814000},{name:"transaction_view",count:641000},{name:"payment_initiated",count:228000}],
    os:[{name:"iOS",value:38},{name:"Windows",value:28},{name:"Android",value:22},{name:"Mac",value:10},{name:"Linux",value:2}],
    browsers:[{name:"Safari",value:44},{name:"Chrome",value:36},{name:"Chrome Mobile",value:14},{name:"Firefox",value:4},{name:"Samsung Internet",value:2}],
    referrers:[{name:"monzo.com",visitors:228000},{name:"google.com",visitors:34200},{name:"community.monzo.com",visitors:18400},{name:"bing.com",visitors:8200},{name:"trustpilot.com",visitors:4800},{name:"reddit.com",visitors:3200}],
    utm:[{name:"utm_source=monzo_app",visitors:82400},{name:"utm_source=email",visitors:46200},{name:"utm_campaign=web_launch",visitors:24800},{name:"utm_medium=push",visitors:18400},{name:"utm_source=sms",visitors:12200}],
    countries:[
      {country:"United Kingdom",sessions:969000,users:758000,views:1841000,duration:318,bounce:14.8,prevSessions:820000,prevUsers:641000,prevViews:1558000,prevDuration:282,prevBounce:29.4},
      {country:"Ireland",sessions:68400,users:53400,views:130000,duration:302,bounce:18.2,prevSessions:57800,prevUsers:45200,prevViews:110000,prevDuration:268,prevBounce:32.8},
      {country:"United States",sessions:45600,users:35600,views:86600,duration:288,bounce:19.4,prevSessions:38600,prevUsers:30200,prevViews:73400,prevDuration:256,prevBounce:34.4},
      {country:"Germany",sessions:22800,users:17800,views:43300,duration:294,bounce:16.8,prevSessions:19300,prevUsers:15100,prevViews:36700,prevDuration:262,prevBounce:31.6},
      {country:"Australia",sessions:15200,users:11900,views:28900,duration:286,bounce:18.8,prevSessions:12900,prevUsers:10100,prevViews:24500,prevDuration:254,prevBounce:33.4},
    ],
    sources:[
      {source:"(direct)",sessions:825000,users:645000,views:1568000,duration:318,bounce:14.8,prevSessions:698000,prevUsers:546000,prevViews:1327000,prevDuration:282,prevBounce:29.8},
      {source:"monzo.com",sessions:104900,users:82000,views:199300,duration:302,bounce:17.4,prevSessions:88800,prevUsers:69400,prevViews:168700,prevDuration:268,prevBounce:32.4},
      {source:"google",sessions:41000,users:32100,views:77900,duration:274,bounce:22.8,prevSessions:34700,prevUsers:27200,prevViews:66000,prevDuration:242,prevBounce:41.2},
    ],
    pages:[
      {property:"web.monzo.com",page:"/",sessions:984000,users:770000,views:1869600,bounce:"16.8%",duration:"5m 28s"},
      {property:"web.monzo.com",page:"/transactions/",sessions:641000,users:501000,views:1217900,bounce:"8.4%",duration:"6m 42s"},
      {property:"web.monzo.com",page:"/account/",sessions:512000,users:400000,views:972800,bounce:"9.8%",duration:"4m 58s"},
      {property:"web.monzo.com",page:"/payments/make-payment/",sessions:384000,users:300000,views:729600,bounce:"5.2%",duration:"7m 12s"},
      {property:"web.monzo.com",page:"/pots/",sessions:298000,users:233000,views:566200,bounce:"10.4%",duration:"5m 14s"},
      {property:"web.monzo.com",page:"/savings/",sessions:228000,users:178000,views:433200,bounce:"12.4%",duration:"5m 42s"},
      {property:"web.monzo.com",page:"/login/",sessions:198000,users:154000,views:376200,bounce:"28.4%",duration:"2m 28s"},
      {property:"web.monzo.com",page:"/settings/",sessions:164000,users:128000,views:311600,bounce:"14.8%",duration:"3m 48s"},
      {property:"web.monzo.com",page:"/payments/contacts/",sessions:142000,users:111000,views:269800,bounce:"7.4%",duration:"4m 22s"},
      {property:"web.monzo.com",page:"/flex/",sessions:118000,users:92000,views:224200,bounce:"12.8%",duration:"4m 58s"},
    ],
    yoy:[
      {month:"Jan",y2024:614000,y2025:812000,y2026:978000},
      {month:"Feb",y2024:588000,y2025:784000,y2026:1010000},
      {month:"Mar",y2024:641000,y2025:842000,y2026:1140000},
      {month:"Apr",y2024:684000,y2025:898000,y2026:null},
      {month:"May",y2024:712000,y2025:941000,y2026:null},
      {month:"Jun",y2024:698000,y2025:928000,y2026:null},
      {month:"Jul",y2024:684000,y2025:912000,y2026:null},
      {month:"Aug",y2024:741000,y2025:984000,y2026:null},
      {month:"Sep",y2024:769000,y2025:1028000,y2026:null},
      {month:"Oct",y2024:798000,y2025:1084000,y2026:null},
      {month:"Nov",y2024:841000,y2025:1141000,y2026:null},
      {month:"Dec",y2024:884000,y2025:1198000,y2026:null},
    ],
  },
  "community.monzo.com": {
    kpi:{ sessions:"490,000", sessionsN:490000, sessionsPrev:427000, sessChg:"+14.8%",
          users:"312,000",   usersN:312000,   usersPrev:281000,   usrChg:"+11.0%",
          views:"894,000",  viewsN:894000,  viewsPrev:768000,   vwChg:"+16.4%",
          dur:"4m 28s", durN:268, durPrev:249, durChg:"+7.6%", durPos:true,
          bounce:"26.2%", bounceN:26.2, bouncePrev:28.4, bounceChg:"-7.7%", bouncePos:true },
    channels:[
      {name:"Direct",value:48.4,sessions:237200,color:"#e4e4e7"},{name:"Organic Search",value:28.2,sessions:138200,color:"#e4e4e7"},
      {name:"Referral",value:14.8,sessions:72500,color:"#e4e4e7"},{name:"Organic Social",value:5.8,sessions:28400,color:"#e4e4e7"},
      {name:"Email",value:2.4,sessions:11800,color:"#e4e4e7"},{name:"Unassigned",value:0.4,sessions:1900,color:"#e4e4e7"},
      {name:"Organic Video",value:0.0,sessions:0,color:"#e4e4e7"}],
    devices:[{name:"Desktop",value:68.4,sessions:335200,color:"#e4e4e7"},{name:"Mobile",value:28.8,sessions:141100,color:"#71717a"},{name:"Tablet",value:2.8,sessions:13700,color:"#3f3f46"}],
    newReturn:[{name:"New",value:42.4,sessions:207800,color:"#e4e4e7"},{name:"Returning",value:57.6,sessions:282200,color:"#52525b"}],
    events:[{name:"page_view",count:894000},{name:"session_start",count:490000},{name:"topic_view",count:368000},{name:"reply_created",count:124000},{name:"user_engagement",count:98400},{name:"like",count:74200}],
    os:[{name:"Windows",value:58},{name:"Mac",value:22},{name:"iOS",value:10},{name:"Android",value:7},{name:"Linux",value:3}],
    browsers:[{name:"Chrome",value:56},{name:"Safari",value:20},{name:"Firefox",value:12},{name:"Microsoft Edge",value:8},{name:"Brave",value:4}],
    referrers:[{name:"monzo.com",visitors:72400},{name:"google.com",visitors:41200},{name:"t.co",visitors:18400},{name:"reddit.com",visitors:14200},{name:"bing.com",visitors:8600}],
    utm:[{name:"utm_source=monzo_app",visitors:28400},{name:"utm_source=email",visitors:18200},{name:"utm_source=twitter",visitors:11400},{name:"utm_campaign=community",visitors:8200}],
    countries:[
      {country:"United Kingdom",sessions:343000,users:218000,views:625000,duration:272,bounce:24.2,prevSessions:298800,prevUsers:190000,prevViews:545000,prevDuration:254,prevBounce:38.4},
      {country:"United States",sessions:49000,users:31200,views:89300,duration:254,bounce:28.8,prevSessions:42700,prevUsers:27200,prevViews:77800,prevDuration:238,prevBounce:44.2},
      {country:"Ireland",sessions:29400,users:18700,views:53600,duration:258,bounce:26.4,prevSessions:25600,prevUsers:16300,prevViews:46700,prevDuration:241,prevBounce:42.8},
      {country:"Germany",sessions:19600,users:12500,views:35700,duration:248,bounce:30.2,prevSessions:17100,prevUsers:10900,prevViews:31100,prevDuration:231,prevBounce:46.9},
      {country:"Australia",sessions:14700,users:9400,views:26800,duration:256,bounce:27.4,prevSessions:12800,prevUsers:8200,prevViews:23300,prevDuration:239,prevBounce:43.4},
    ],
    sources:[
      {source:"(direct)",sessions:237000,users:151000,views:432000,duration:272,bounce:24.4,prevSessions:206000,prevUsers:132000,prevViews:376000,prevDuration:254,prevBounce:38.4},
      {source:"google",sessions:138000,users:88000,views:252000,duration:248,bounce:28.8,prevSessions:120000,prevUsers:76000,prevViews:219000,prevDuration:231,prevBounce:44.8},
      {source:"monzo.com",sessions:72500,users:46200,views:132000,duration:258,bounce:24.8,prevSessions:63100,prevUsers:40200,prevViews:115000,prevDuration:241,prevBounce:40.4},
    ],
    pages:[
      {property:"community.monzo.com",page:"/",sessions:312000,users:243800,views:567800,bounce:"26.4%",duration:"4m 42s"},
      {property:"community.monzo.com",page:"/c/monzo-chat/",sessions:184000,users:143800,views:334900,bounce:"18.8%",duration:"6m 14s"},
      {property:"community.monzo.com",page:"/c/feedback-and-ideas/",sessions:142000,users:110900,views:258400,bounce:"14.8%",duration:"7m 02s"},
      {property:"community.monzo.com",page:"/c/help-and-support/",sessions:118000,users:92200,views:214800,bounce:"22.4%",duration:"5m 28s"},
      {property:"community.monzo.com",page:"/latest/",sessions:98000,users:76600,views:178400,bounce:"11.4%",duration:"8m 14s"},
      {property:"community.monzo.com",page:"/top/",sessions:74000,users:57800,views:134700,bounce:"16.2%",duration:"6m 42s"},
      {property:"community.monzo.com",page:"/c/marketplace/",sessions:58000,users:45300,views:105600,bounce:"24.2%",duration:"4m 58s"},
      {property:"community.monzo.com",page:"/c/monzo-business/",sessions:42000,users:32800,views:76400,bounce:"22.8%",duration:"5m 12s"},
    ],
    yoy:[
      {month:"Jan",y2024:238000,y2025:312000,y2026:426000},
      {month:"Feb",y2024:228000,y2025:298000,y2026:448000},
      {month:"Mar",y2024:257000,y2025:336000,y2026:490000},
      {month:"Apr",y2024:274000,y2025:358000,y2026:null},
      {month:"May",y2024:282000,y2025:368000,y2026:null},
      {month:"Jun",y2024:268000,y2025:354000,y2026:null},
      {month:"Jul",y2024:262000,y2025:346000,y2026:null},
      {month:"Aug",y2024:284000,y2025:374000,y2026:null},
      {month:"Sep",y2024:295000,y2025:388000,y2026:null},
      {month:"Oct",y2024:308000,y2025:408000,y2026:null},
      {month:"Nov",y2024:323000,y2025:428000,y2026:null},
      {month:"Dec",y2024:338000,y2025:448000,y2026:null},
    ],
  },
  "monzo.com/blog": {
    kpi:{ sessions:"220,000", sessionsN:220000, sessionsPrev:167500, sessChg:"+31.3%",
          users:"168,000",   usersN:168000,   usersPrev:128000,   usrChg:"+31.3%",
          views:"176,000",  viewsN:176000,  viewsPrev:134000,   vwChg:"+31.3%",
          dur:"2m 44s", durN:164, durPrev:157, durChg:"+4.5%", durPos:true,
          bounce:"46.2%", bounceN:46.2, bouncePrev:49.8, bounceChg:"-7.2%", bouncePos:true },
    channels:[
      {name:"Organic Search",value:52.4,sessions:115300,color:"#e4e4e7"},{name:"Direct",value:22.8,sessions:50200,color:"#e4e4e7"},
      {name:"Organic Social",value:14.2,sessions:31200,color:"#e4e4e7"},{name:"Referral",value:6.4,sessions:14100,color:"#e4e4e7"},
      {name:"Email",value:3.4,sessions:7500,color:"#e4e4e7"},{name:"Organic Video",value:0.8,sessions:1760,color:"#e4e4e7"},
      {name:"Unassigned",value:0.0,sessions:0,color:"#e4e4e7"}],
    devices:[{name:"Desktop",value:54.2,sessions:119200,color:"#e4e4e7"},{name:"Mobile",value:43.4,sessions:95500,color:"#71717a"},{name:"Tablet",value:2.4,sessions:5300,color:"#3f3f46"}],
    newReturn:[{name:"New",value:78.4,sessions:172500,color:"#e4e4e7"},{name:"Returning",value:21.6,sessions:47500,color:"#52525b"}],
    events:[{name:"page_view",count:176000},{name:"session_start",count:220000},{name:"scroll",count:141200},{name:"click",count:88000},{name:"share",count:32400},{name:"user_engagement",count:28600}],
    os:[{name:"Windows",value:48},{name:"Mac",value:24},{name:"iOS",value:16},{name:"Android",value:9},{name:"Linux",value:3}],
    browsers:[{name:"Chrome",value:54},{name:"Safari",value:26},{name:"Firefox",value:8},{name:"Microsoft Edge",value:8},{name:"Brave",value:4}],
    referrers:[{name:"google.com",visitors:48400},{name:"t.co",visitors:28200},{name:"reddit.com",visitors:18400},{name:"linkedin.com",visitors:12800},{name:"facebook.com",visitors:8200},{name:"bing.com",visitors:4800}],
    utm:[{name:"utm_source=twitter",visitors:18400},{name:"utm_campaign=blog_2026",visitors:12800},{name:"utm_source=linkedin",visitors:9400},{name:"utm_medium=social",visitors:7200},{name:"utm_source=newsletter",visitors:4800}],
    countries:[
      {country:"United Kingdom",sessions:154000,users:117600,views:123200,duration:168,bounce:44.8,prevSessions:117200,prevUsers:89600,prevViews:93800,prevDuration:161,prevBounce:61.2},
      {country:"United States",sessions:24200,users:18500,views:19400,duration:158,bounce:48.4,prevSessions:18400,prevUsers:14100,prevViews:14800,prevDuration:151,prevBounce:66.8},
      {country:"Ireland",sessions:13200,users:10100,views:10600,duration:162,bounce:46.4,prevSessions:10000,prevUsers:7700,prevViews:8000,prevDuration:155,prevBounce:63.4},
      {country:"Canada",sessions:7700,users:5900,views:6200,duration:154,bounce:52.4,prevSessions:5900,prevUsers:4500,prevViews:4700,prevDuration:147,prevBounce:69.8},
      {country:"Australia",sessions:6600,users:5000,views:5300,duration:158,bounce:47.8,prevSessions:5000,prevUsers:3800,prevViews:4000,prevDuration:151,prevBounce:64.8},
    ],
    sources:[
      {source:"google",sessions:115000,users:87800,views:92000,duration:162,bounce:46.2,prevSessions:87500,prevUsers:66800,prevViews:70000,prevDuration:155,prevBounce:63.4},
      {source:"(direct)",sessions:50200,users:38300,views:40200,duration:172,bounce:40.8,prevSessions:38200,prevUsers:29200,prevViews:30600,prevDuration:164,prevBounce:57.2},
      {source:"t.co",sessions:31200,users:23800,views:25000,duration:148,bounce:52.4,prevSessions:23700,prevUsers:18100,prevViews:19000,prevDuration:141,prevBounce:70.8},
    ],
    pages:[
      {property:"monzo.com",page:"/blog/",sessions:98400,users:76800,views:78700,bounce:"44.2%",duration:"1m 48s"},
      {property:"monzo.com",page:"/blog/instant-access-savings-are-here/",sessions:42800,users:33400,views:34200,bounce:"46.8%",duration:"3m 14s"},
      {property:"monzo.com",page:"/blog/machine-learning-at-monzo/",sessions:28400,users:22200,views:22700,bounce:"48.4%",duration:"4m 28s"},
      {property:"monzo.com",page:"/blog/how-we-forecast-customer-growth/",sessions:22800,users:17800,views:18200,bounce:"49.8%",duration:"5m 12s"},
      {property:"monzo.com",page:"/blog/1p-saving-challenge/",sessions:18400,users:14400,views:14700,bounce:"31.4%",duration:"3m 48s"},
      {property:"monzo.com",page:"/blog/joint-account-update/",sessions:14200,users:11100,views:11400,bounce:"48.2%",duration:"2m 54s"},
      {property:"monzo.com",page:"/blog/monzo-2025-in-review/",sessions:11400,users:8900,views:9100,bounce:"43.4%",duration:"4m 02s"},
      {property:"monzo.com",page:"/blog/pet-nup-hidden-costs/",sessions:8200,users:6400,views:6600,bounce:"52.8%",duration:"2m 28s"},
    ],
    yoy:[
      {month:"Jan",y2024:88000,y2025:124000,y2026:192000},
      {month:"Feb",y2024:84000,y2025:118000,y2026:200000},
      {month:"Mar",y2024:95000,y2025:134000,y2026:220000},
      {month:"Apr",y2024:101000,y2025:143000,y2026:null},
      {month:"May",y2024:104000,y2025:148000,y2026:null},
      {month:"Jun",y2024:99000,y2025:141000,y2026:null},
      {month:"Jul",y2024:97000,y2025:138000,y2026:null},
      {month:"Aug",y2024:106000,y2025:151000,y2026:null},
      {month:"Sep",y2024:110000,y2025:157000,y2026:null},
      {month:"Oct",y2024:115000,y2025:164000,y2026:null},
      {month:"Nov",y2024:121000,y2025:172000,y2026:null},
      {month:"Dec",y2024:126000,y2025:180000,y2026:null},
    ],
  },
  "monzo.com/help": {
    kpi:{ sessions:"110,000", sessionsN:110000, sessionsPrev:101600, sessChg:"+8.3%",
          users:"94,000",   usersN:94000,   usersPrev:88000,   usrChg:"+6.8%",
          views:"94,600",  viewsN:94600,  viewsPrev:86700,   vwChg:"+9.1%",
          dur:"1m 52s", durN:112, durPrev:115, durChg:"-2.6%", durPos:false,
          bounce:"56.2%", bounceN:56.2, bouncePrev:60.1, bounceChg:"-6.5%", bouncePos:true },
    channels:[
      {name:"Organic Search",value:68.4,sessions:75200,color:"#e4e4e7"},{name:"Direct",value:18.4,sessions:20200,color:"#e4e4e7"},
      {name:"Referral",value:8.4,sessions:9200,color:"#e4e4e7"},{name:"Organic Social",value:2.8,sessions:3100,color:"#e4e4e7"},
      {name:"Email",value:1.6,sessions:1760,color:"#e4e4e7"},{name:"Unassigned",value:0.4,sessions:440,color:"#e4e4e7"},
      {name:"Organic Video",value:0.0,sessions:0,color:"#e4e4e7"}],
    devices:[{name:"Mobile",value:58.4,sessions:64200,color:"#71717a"},{name:"Desktop",value:38.8,sessions:42700,color:"#e4e4e7"},{name:"Tablet",value:2.8,sessions:3100,color:"#3f3f46"}],
    newReturn:[{name:"New",value:72.4,sessions:79600,color:"#e4e4e7"},{name:"Returning",value:27.6,sessions:30400,color:"#52525b"}],
    events:[{name:"page_view",count:94600},{name:"session_start",count:110000},{name:"scroll",count:48400},{name:"click",count:38400},{name:"search",count:28400},{name:"user_engagement",count:18400}],
    os:[{name:"iOS",value:42},{name:"Windows",value:28},{name:"Android",value:18},{name:"Mac",value:8},{name:"Linux",value:4}],
    browsers:[{name:"Safari",value:44},{name:"Chrome",value:32},{name:"Chrome Mobile",value:14},{name:"Samsung Internet",value:6},{name:"Firefox",value:4}],
    referrers:[{name:"google.com",visitors:68400},{name:"monzo.com",visitors:9200},{name:"bing.com",visitors:4800},{name:"community.monzo.com",visitors:3200},{name:"t.co",visitors:1800}],
    utm:[{name:"utm_source=google",visitors:4800},{name:"utm_campaign=help",visitors:2200},{name:"utm_source=email",visitors:1600}],
    countries:[
      {country:"United Kingdom",sessions:88000,users:75200,views:75700,duration:114,bounce:54.8,prevSessions:81200,prevUsers:69400,prevViews:69800,prevDuration:117,prevBounce:68.6},
      {country:"Ireland",sessions:6600,users:5600,views:5700,duration:108,bounce:58.4,prevSessions:6100,prevUsers:5200,prevViews:5300,prevDuration:111,prevBounce:71.8},
      {country:"United States",sessions:5500,users:4700,views:4700,duration:104,bounce:60.4,prevSessions:5100,prevUsers:4300,prevViews:4400,prevDuration:107,prevBounce:74.8},
      {country:"Australia",sessions:3300,users:2800,views:2800,duration:108,bounce:58.8,prevSessions:3000,prevUsers:2600,prevViews:2600,prevDuration:111,prevBounce:72.4},
      {country:"Germany",sessions:2200,users:1900,views:1900,duration:102,bounce:62.4,prevSessions:2000,prevUsers:1700,prevViews:1700,prevDuration:105,prevBounce:76.8},
    ],
    sources:[
      {source:"google",sessions:75200,users:64200,views:64700,duration:112,bounce:56.4,prevSessions:69400,prevUsers:59200,prevViews:59700,prevDuration:115,prevBounce:71.2},
      {source:"(direct)",sessions:20200,users:17200,views:17400,duration:118,bounce:52.8,prevSessions:18600,prevUsers:15900,prevViews:16000,prevDuration:121,prevBounce:67.4},
      {source:"monzo.com",sessions:9200,users:7900,views:7900,duration:108,bounce:58.8,prevSessions:8500,prevUsers:7300,prevViews:7300,prevDuration:111,prevBounce:73.4},
    ],
    pages:[
      {property:"monzo.com",page:"/help/",sessions:42400,users:36200,views:77200,bounce:"54.2%",duration:"1m 28s"},
      {property:"monzo.com",page:"/help/spending-and-payments/",sessions:18400,users:15700,views:33500,bounce:"52.8%",duration:"1m 54s"},
      {property:"monzo.com",page:"/help/account-and-profile/",sessions:14200,users:12100,views:25800,bounce:"59.8%",duration:"1m 42s"},
      {property:"monzo.com",page:"/help/card-and-pin/",sessions:11400,users:9700,views:20700,bounce:"62.4%",duration:"1m 28s"},
      {property:"monzo.com",page:"/help/saving/",sessions:8200,users:7000,views:14900,bounce:"54.8%",duration:"2m 12s"},
      {property:"monzo.com",page:"/help/borrowing/",sessions:6200,users:5300,views:11300,bounce:"56.4%",duration:"2m 24s"},
      {property:"monzo.com",page:"/help/business-accounts/",sessions:4800,users:4100,views:8700,bounce:"57.8%",duration:"1m 58s"},
      {property:"monzo.com",page:"/help/account-and-profile/branches/",sessions:3200,users:2700,views:5800,bounce:"64.8%",duration:"0m 58s"},
    ],
    yoy:[
      {month:"Jan",y2024:72000,y2025:88000,y2026:96000},
      {month:"Feb",y2024:69000,y2025:84000,y2026:102000},
      {month:"Mar",y2024:78000,y2025:96000,y2026:110000},
      {month:"Apr",y2024:83000,y2025:102000,y2026:null},
      {month:"May",y2024:86000,y2025:106000,y2026:null},
      {month:"Jun",y2024:82000,y2025:101000,y2026:null},
      {month:"Jul",y2024:80000,y2025:98000,y2026:null},
      {month:"Aug",y2024:87000,y2025:107000,y2026:null},
      {month:"Sep",y2024:90000,y2025:111000,y2026:null},
      {month:"Oct",y2024:94000,y2025:116000,y2026:null},
      {month:"Nov",y2024:99000,y2025:122000,y2026:null},
      {month:"Dec",y2024:103000,y2025:128000,y2026:null},
    ],
  },
  "api.monzo.com": {
    kpi:{ sessions:"54,300", sessionsN:54300, sessionsPrev:44300, sessChg:"+22.6%",
          users:"38,200",   usersN:38200,   usersPrev:31900,   usrChg:"+19.7%",
          views:"113,700",  viewsN:113700,  viewsPrev:91600,   vwChg:"+24.1%",
          dur:"6m 14s", durN:374, durPrev:341, durChg:"+9.7%", durPos:true,
          bounce:"24.8%", bounceN:24.8, bouncePrev:27.4, bounceChg:"-9.5%", bouncePos:true },
    channels:[
      {name:"Direct",value:44.2,sessions:24000,color:"#e4e4e7"},{name:"Referral",value:34.8,sessions:18900,color:"#e4e4e7"},
      {name:"Organic Search",value:16.4,sessions:8900,color:"#e4e4e7"},{name:"Unassigned",value:2.8,sessions:1520,color:"#e4e4e7"},
      {name:"Organic Social",value:1.4,sessions:760,color:"#e4e4e7"},{name:"Email",value:0.4,sessions:220,color:"#e4e4e7"},
      {name:"Organic Video",value:0.0,sessions:0,color:"#e4e4e7"}],
    devices:[{name:"Desktop",value:84.4,sessions:45800,color:"#e4e4e7"},{name:"Mobile",value:12.8,sessions:6900,color:"#71717a"},{name:"Tablet",value:2.8,sessions:1600,color:"#3f3f46"}],
    newReturn:[{name:"New",value:48.4,sessions:26300,color:"#e4e4e7"},{name:"Returning",value:51.6,sessions:28000,color:"#52525b"}],
    events:[{name:"page_view",count:113700},{name:"session_start",count:54300},{name:"docs_search",count:38400},{name:"code_copy",count:28400},{name:"user_engagement",count:24200},{name:"external_link",count:18400}],
    os:[{name:"Mac",value:42},{name:"Windows",value:32},{name:"Linux",value:18},{name:"iOS",value:5},{name:"Android",value:3}],
    browsers:[{name:"Chrome",value:58},{name:"Firefox",value:18},{name:"Safari",value:14},{name:"Microsoft Edge",value:6},{name:"Brave",value:4}],
    referrers:[{name:"github.com",visitors:12400},{name:"stackoverflow.com",visitors:8200},{name:"monzo.com",visitors:4800},{name:"community.monzo.com",visitors:3200},{name:"reddit.com",visitors:2400},{name:"dev.to",visitors:1800}],
    utm:[{name:"utm_source=github",visitors:4800},{name:"utm_campaign=developer",visitors:2800},{name:"utm_source=stackoverflow",visitors:2200},{name:"utm_medium=docs",visitors:1600}],
    countries:[
      {country:"United Kingdom",sessions:21700,users:15300,views:45400,duration:382,bounce:22.4,prevSessions:17700,prevUsers:12500,prevViews:37000,prevDuration:348,prevBounce:32.1},
      {country:"United States",sessions:13600,users:9600,views:28500,duration:368,bounce:26.2,prevSessions:11100,prevUsers:7800,prevViews:23200,prevDuration:335,prevBounce:36.1},
      {country:"Germany",sessions:5400,users:3800,views:11300,duration:374,bounce:24.4,prevSessions:4400,prevUsers:3100,prevViews:9200,prevDuration:341,prevBounce:33.8},
      {country:"India",sessions:4900,users:3500,views:10300,duration:348,bounce:28.8,prevSessions:4000,prevUsers:2900,prevViews:8400,prevDuration:317,prevBounce:40.8},
      {country:"Netherlands",sessions:2700,users:1900,views:5700,duration:362,bounce:24.8,prevSessions:2200,prevUsers:1600,prevViews:4600,prevDuration:331,prevBounce:34.4},
    ],
    sources:[
      {source:"(direct)",sessions:24000,users:16900,views:50300,duration:384,bounce:22.4,prevSessions:19600,prevUsers:13800,prevViews:41000,prevDuration:350,prevBounce:32.4},
      {source:"github.com",sessions:12400,users:8700,views:26000,duration:368,bounce:26.4,prevSessions:10100,prevUsers:7100,prevViews:21200,prevDuration:335,prevBounce:36.8},
      {source:"google",sessions:8900,users:6300,views:18700,duration:354,bounce:28.8,prevSessions:7300,prevUsers:5100,prevViews:15300,prevDuration:323,prevBounce:40.8},
    ],
    pages:[
      {property:"api.monzo.com",page:"/docs/",sessions:28400,users:20000,views:59400,bounce:"18.4%",duration:"7m 12s"},
      {property:"api.monzo.com",page:"/",sessions:18400,users:13000,views:38500,bounce:"26.4%",duration:"4m 48s"},
      {property:"api.monzo.com",page:"/reference/",sessions:14200,users:10000,views:29700,bounce:"14.8%",duration:"8m 42s"},
      {property:"api.monzo.com",page:"/authentication/",sessions:11400,users:8000,views:23800,bounce:"16.8%",duration:"7m 28s"},
      {property:"api.monzo.com",page:"/endpoints/transactions/",sessions:8200,users:5800,views:17100,bounce:"12.4%",duration:"9m 12s"},
      {property:"api.monzo.com",page:"/endpoints/accounts/",sessions:6200,users:4400,views:13000,bounce:"13.8%",duration:"8m 28s"},
      {property:"api.monzo.com",page:"/endpoints/webhooks/",sessions:4800,users:3400,views:10000,bounce:"14.8%",duration:"7m 54s"},
      {property:"api.monzo.com",page:"/getting-started/",sessions:3800,users:2700,views:7900,bounce:"22.8%",duration:"6m 14s"},
    ],
    yoy:[
      {month:"Jan",y2024:22800,y2025:31200,y2026:47100},
      {month:"Feb",y2024:21800,y2025:29800,y2026:48800},
      {month:"Mar",y2024:24600,y2025:33600,y2026:54300},
      {month:"Apr",y2024:26200,y2025:35800,y2026:null},
      {month:"May",y2024:27000,y2025:36900,y2026:null},
      {month:"Jun",y2024:25700,y2025:35100,y2026:null},
      {month:"Jul",y2024:25100,y2025:34300,y2026:null},
      {month:"Aug",y2024:27200,y2025:37200,y2026:null},
      {month:"Sep",y2024:28200,y2025:38600,y2026:null},
      {month:"Oct",y2024:29400,y2025:40200,y2026:null},
      {month:"Nov",y2024:30900,y2025:42200,y2026:null},
      {month:"Dec",y2024:32300,y2025:44200,y2026:null},
    ],
  },
};

const propertyDataMap = {
  Sessions:     [{ name:"monzo", value:75.5, sessions:6200000, color:"#e4e4e7" },{ name:"web", value:13.9, sessions:1140000, color:"#a1a1aa" },{ name:"community", value:6.0, sessions:490000, color:"#71717a" },{ name:"api", value:4.6, sessions:380000, color:"#3f3f46" }],
  Users:        [{ name:"monzo", value:75.1, sessions:4482000, color:"#e4e4e7" },{ name:"web", value:14.2, sessions:892000, color:"#a1a1aa" },{ name:"community", value:6.6, sessions:414000, color:"#71717a" },{ name:"api", value:4.1, sessions:258000, color:"#3f3f46" }],
  Views:        [{ name:"monzo", value:77.2, sessions:11284000, color:"#e4e4e7" },{ name:"web", value:14.8, sessions:2166000, color:"#a1a1aa" },{ name:"community", value:6.1, sessions:892000, color:"#71717a" },{ name:"api", value:1.9, sessions:278000, color:"#3f3f46" }],
  "Avg Duration":[{ name:"monzo", value:35.8, sessions:238,   color:"#e4e4e7" },{ name:"web", value:47.0, sessions:312,    color:"#a1a1aa" },{ name:"community", value:40.3, sessions:268,    color:"#71717a" },{ name:"api", value:56.2, sessions:374,    color:"#3f3f46" }],
  "Bounce Rate": [{ name:"monzo", value:34.8, sessions:34.8, color:"#e4e4e7" },{ name:"web", value:16.4, sessions:16.4, color:"#a1a1aa" },{ name:"community", value:26.2, sessions:26.2, color:"#71717a" },{ name:"api", value:24.8, sessions:24.8, color:"#3f3f46" }],
};

const deviceData       = [{ name:"Desktop", value:61.2, sessions:5027153, color:"#e4e4e7" },{ name:"Mobile",  value:37.4, sessions:3072148,  color:"#71717a" },{ name:"Tablet",  value:1.4,  sessions:114999,    color:"#3f3f46" }];
const newReturningData = [{ name:"New",      value:61.8, sessions:5076436, color:"#e4e4e7" },{ name:"Returning",value:38.2,sessions:3137864,  color:"#52525b" }];
const channelData      = [{ name:"Direct", value:52.4, sessions:4304254, prevSessions:3821000, color:"#e4e4e7" },{ name:"Organic Search", value:31.2, sessions:2562862, prevSessions:2198000, color:"#e4e4e7" },{ name:"Referral", value:7.4, sessions:607858, prevSessions:562000, color:"#e4e4e7" },{ name:"Organic Social", value:5.1, sessions:418929, prevSessions:364000, color:"#e4e4e7" },{ name:"Email", value:2.4, sessions:197143, prevSessions:184000, color:"#e4e4e7" },{ name:"Organic Video", value:1.1, sessions:90357, prevSessions:76000, color:"#e4e4e7" },{ name:"Unassigned", value:0.4, sessions:32857, prevSessions:29000, color:"#e4e4e7" }];
const referrerData     = [{ name:"web.monzo.com", visitors:248700, prevVisitors:214000 },{ name:"community.monzo.com", visitors:187400, prevVisitors:168000 },{ name:"monzo.com/blog", visitors:142800, prevVisitors:108000 },{ name:"monzo.com/help", visitors:118600, prevVisitors:109000 },{ name:"monzo.com/business", visitors:94200, prevVisitors:79000 },{ name:"api.monzo.com", visitors:61300, prevVisitors:50000 },{ name:"monzo.com/about", visitors:48700, prevVisitors:44000 },{ name:"moneysavingexpert.com", visitors:39200, prevVisitors:34000 },{ name:"t.co", visitors:28900, prevVisitors:31000 },{ name:"reddit.com", visitors:22400, prevVisitors:19000 },{ name:"trustpilot.com", visitors:14300, prevVisitors:12000 }];
const utmData          = [{ name:"utm_source=google", visitors:4820, prevVisitors:4100 },{ name:"utm_source=newsletter", visitors:3140, prevVisitors:2880 },{ name:"utm_source=twitter", visitors:2280, prevVisitors:2140 },{ name:"utm_source=linkedin", visitors:1960, prevVisitors:1740 },{ name:"utm_source=github", visitors:1540, prevVisitors:1280 },{ name:"utm_medium=cpc", visitors:1120, prevVisitors:980 },{ name:"utm_campaign=launch_2026", visitors:890, prevVisitors:0 },{ name:"utm_source=youtube", visitors:740, prevVisitors:620 }];
const eventData        = [{ name:"page_view", count:2700000, prev:2180000 },{ name:"session_start", count:1800000, prev:1512000 },{ name:"first_visit", count:1300000, prev:1081000 },{ name:"user_engagement", count:1100000, prev:942000 },{ name:"scroll", count:343000, prev:298000 },{ name:"click", count:150000, prev:138000 }];
const osData           = [{ name:"Windows", value:62, prevValue:64 },{ name:"Mac", value:16, prevValue:15 },{ name:"iOS", value:10, prevValue:9 },{ name:"Android", value:6, prevValue:6 },{ name:"Linux", value:5, prevValue:4 }];
const browserData      = [{ name:"Chrome", value:53, prevValue:51 },{ name:"Microsoft Edge", value:21, prevValue:22 },{ name:"Firefox", value:5, prevValue:6 },{ name:"Twitter", value:4, prevValue:4 },{ name:"Chrome Mobile", value:4, prevValue:3 }];
const topPages = [
  { property:"monzo",     page:"/",                                   sessions:2847300, users:2193400, views:5182100,  bounce:"32.4%", duration:"4m 12s" },
  { property:"monzo",     page:"/personal-account/",                  sessions:891200,  users:712400,  views:1622000,  bounce:"26.8%", duration:"3m 48s" },
  { property:"web",       page:"/",                                   sessions:984000,  users:770000,  views:1869600,  bounce:"16.8%", duration:"5m 28s" },
  { property:"monzo",     page:"/features/pots/",                     sessions:743100,  users:621800,  views:1352400,  bounce:"22.4%", duration:"4m 22s" },
  { property:"community", page:"/",                                   sessions:612400,  users:498200,  views:1114600,  bounce:"26.4%", duration:"4m 42s" },
  { property:"web",       page:"/transactions/",                      sessions:541000,  users:422600,  views:1027900,  bounce:"8.4%",  duration:"6m 42s" },
  { property:"monzo",     page:"/features/savings/",                  sessions:489300,  users:341200,  views:890500,   bounce:"25.4%", duration:"4m 02s" },
  { property:"web",       page:"/account/",                           sessions:432000,  users:337600,  views:820800,   bounce:"9.8%",  duration:"4m 58s" },
  { property:"monzo",     page:"/features/investments/",              sessions:421700,  users:298400,  views:767500,   bounce:"29.8%", duration:"3m 38s" },
  { property:"community", page:"/c/monzo-chat/",                      sessions:384000,  users:300000,  views:699000,   bounce:"18.8%", duration:"6m 14s" },
  { property:"web",       page:"/payments/make-payment/",             sessions:324000,  users:253200,  views:615600,   bounce:"5.2%",  duration:"7m 12s" },
  { property:"monzo",     page:"/features/card-controls/",            sessions:298200,  users:287600,  views:724700,   bounce:"23.4%", duration:"3m 28s" },
  { property:"community", page:"/c/feedback-and-ideas/",              sessions:284000,  users:221900,  views:516900,   bounce:"14.8%", duration:"7m 02s" },
  { property:"monzo",     page:"/get-started/",                       sessions:264200,  users:241300,  views:480800,   bounce:"19.8%", duration:"3m 12s" },
  { property:"api",       page:"/docs/",                              sessions:228400,  users:160800,  views:477800,   bounce:"18.4%", duration:"7m 12s" },
  { property:"monzo",     page:"/features/budgeting/",                sessions:218700,  users:218700,  views:398000,   bounce:"27.2%", duration:"3m 44s" },
  { property:"web",       page:"/pots/",                              sessions:198000,  users:154700,  views:376200,   bounce:"10.4%", duration:"5m 14s" },
  { property:"api",       page:"/",                                   sessions:184000,  users:129400,  views:384800,   bounce:"26.4%", duration:"4m 48s" },
  { property:"community", page:"/c/help-and-support/",                sessions:178000,  users:139200,  views:324000,   bounce:"22.4%", duration:"5m 28s" },
  { property:"monzo",     page:"/features/salary-sorter/",            sessions:164300,  users:128400,  views:299000,   bounce:"28.4%", duration:"3m 18s" },
  { property:"api",       page:"/reference/",                         sessions:142000,  users:99800,   views:297000,   bounce:"14.8%", duration:"8m 42s" },
  { property:"web",       page:"/savings/",                           sessions:138200,  users:108000,  views:262600,   bounce:"12.4%", duration:"5m 42s" },
  { property:"monzo",     page:"/features/joint-account/",            sessions:124700,  users:94200,   views:227000,   bounce:"31.8%", duration:"3m 22s" },
  { property:"api",       page:"/authentication/",                    sessions:114000,  users:80100,   views:238700,   bounce:"16.8%", duration:"7m 28s" },
  { property:"community", page:"/latest/",                            sessions:98000,   users:76600,   views:178400,   bounce:"11.4%", duration:"8m 14s" },
  { property:"monzo",     page:"/features/split-bills/",              sessions:91800,   users:72600,   views:167100,   bounce:"25.8%", duration:"1m 55s" },
  { property:"web",       page:"/login/",                             sessions:88000,   users:68800,   views:167200,   bounce:"28.4%", duration:"2m 28s" },
  { property:"api",       page:"/endpoints/transactions/",            sessions:82000,   users:57700,   views:171600,   bounce:"12.4%", duration:"9m 12s" },
  { property:"monzo",     page:"/business/",                          sessions:77400,   users:64900,   views:140800,   bounce:"30.2%", duration:"3m 02s" },
  { property:"community", page:"/top/",                               sessions:74000,   users:57800,   views:134700,   bounce:"16.2%", duration:"6m 42s" },
];

const navItems = {
  Analytics:      ["Website Analytics","Social Analytics","Email Marketing","Organic Search","Paid Search"],
  Intelligence:   ["Gong","GitHub","Website","Community","Social Media Marketing"],
  Team:           ["Members","Projects","Manage Users","Roles & Permissions"],
  Agents:         ["Gmail Agent","GitHub Agent"],
  System:         ["Status"],
};

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const bg="#09090b", surface="#111113", card="#18181b", border="#1c1c1f", borderMid="#27272a", borderBright="#3f3f46";
const text="#e4e4e7", textMid="#a1a1aa", textDim="#71717a", textMuted="#52525b", textFaint="#3f3f46";
const TABS = ["Sessions","Users","Views","Avg Duration","Bounce Rate"];
const MK = { Sessions:"sessions", Users:"users", Views:"views", "Avg Duration":"duration", "Bounce Rate":"bounce" };
const PK = { Sessions:"prevSessions", Users:"prevUsers", Views:"prevViews", "Avg Duration":"prevDuration", "Bounce Rate":"prevBounce" };
const MT = { Sessions:8214300, Users:5891420, Views:14628900, "Avg Duration":222, "Bounce Rate":32.3 };

const gmv = (row,tab,prev) => row[prev==="prev"?PK[tab]:MK[tab]];
const fn = n => n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(0)+"K":String(n);
const fv = n => n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(n);
const fm = (v,t) => { if(t==="Avg Duration"){const m=Math.floor(v/60),s=v%60;return m>0?`${m}m ${s}s`:`${s}s`;} if(t==="Bounce Rate") return `${v}%`; return fn(v); };

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
// ─── INFO TIP ─────────────────────────────────────────────────────────────────
const INFO_DEFS = {
  "Sessions": "A group of interactions one user takes within a given time frame.",
  "Users": "Unique individuals who visited your site in the selected period.",
  "Views": "Total pages viewed, including repeat views of the same page.",
  "Avg Duration": "Average time users spend per session.",
  "Bounce Rate": "Sessions where users left without any interaction.",
  "Traffic Channels": "How visitors arrive — direct, organic, referral, etc.",
  "Sessions by Property": "Session split across your sub-properties or domains.",
  "Device Breakdown": "Sessions by device: desktop, mobile, or tablet.",
  "New vs Returning": "First-time visitors vs those who've visited before.",
  "Countries": "Where your visitors are coming from, by session volume.",
  "Traffic Sources": "Domains or platforms referring traffic to your site.",
  "Events": "User interactions tracked — clicks, scrolls, form submits.",
  "Operating Systems": "OS breakdown of your visitors.",
  "Browsers": "Browser breakdown of your visitors.",
  "Referrers": "Websites that linked to and sent traffic your way.",
  "UTM Parameters": "Campaign tracking parameters appended to URLs.",
  "Pages": "Your most visited pages by session volume.",
};

const InfoTip = ({id, style={}}) => {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const tip = INFO_DEFS[id];
  if (!tip) return null;
  return (
    <span ref={ref} style={{position:"relative",display:"inline-flex",alignItems:"center",...style}}
      onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke={show?"#a1a1aa":"#52525b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{cursor:"default",transition:"stroke 0.15s",flexShrink:0}}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      {show && (
        <div style={{position:"fixed",zIndex:9999,
          background:"#1c1c1f",border:"1px solid #27272a",borderRadius:6,
          padding:"5px 10px",fontSize:11,color:"#a1a1aa",lineHeight:1.45,fontWeight:400,
          maxWidth:220,boxShadow:"0 4px 16px rgba(0,0,0,.7)",pointerEvents:"none",
          left:ref.current?Math.min(ref.current.getBoundingClientRect().right+8,window.innerWidth-212):0,
          top:ref.current?ref.current.getBoundingClientRect().top+ref.current.getBoundingClientRect().height/2-12:0}}>
          {tip}
        </div>
      )}
    </span>
  );
};

// ── Original backup compatibility helpers ──────────────────────────────────
const toCSV = (headers, rows) => { const esc = v=>`"${String(v).replace(/"/g,'""')}"`; return [headers,...rows].map(r=>r.map(esc).join(",")).join("\n"); };
const downloadExcel = (filename, headers, rows) => { const tr=[headers,...rows].map(r=>"<tr>"+r.map(c=>`<td>${c}</td>`).join("")+"</tr>").join(""); const html=`<html><head><meta charset="utf-8"/></head><body><table>${tr}</table></body></html>`; const url=URL.createObjectURL(new Blob([html],{type:"application/vnd.ms-excel"})); const a=document.createElement("a");a.href=url;a.download=filename+".xls";a.click();URL.revokeObjectURL(url); };

const PropertyBadge = ({name}) => { const colors={monzo:"#10b981",web:"#3b82f6",community:"#ec4899",api:"#f59e0b"}; return <span style={{background:(colors[name]||"#666")+"22",color:colors[name]||"#666",border:`1px solid ${(colors[name]||"#666")}44`,borderRadius:4,padding:"2px 7px",fontSize:11,fontWeight:600}}>{name}</span>; };

const ExportMenu = ({label,headers,rows}) => {
  const [open,setOpen]=useState(false); const ref=useRef();
  useEffect(()=>{ const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const filename=(label||"export").toLowerCase().replace(/\s+/g,"_");
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{background:"#141414",border:"1px solid #222",borderRadius:6,color:"#666",fontSize:11,padding:"5px 10px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>↓ Export</button>
      {open&&(<div style={{position:"absolute",right:0,top:"calc(100% + 6px)",zIndex:100,background:"#141414",border:"1px solid #222",borderRadius:8,overflow:"hidden",minWidth:90,boxShadow:"0 8px 24px rgba(0,0,0,.5)"}}>
        {[{icon:null,iconEl:"csv",label:"Export as CSV",action:()=>{const blob=new Blob([toCSV(headers,rows)],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename+".csv";a.click();URL.revokeObjectURL(url);setOpen(false);}},{icon:null,iconEl:"excel",label:"Export as Excel",action:()=>{downloadExcel(filename,headers,rows);setOpen(false);}},{icon:null,iconEl:"sheets",label:"Open in Google Sheets",action:()=>{openSheetsFromCSV(toCSV(headers,rows));setOpen(false);}}].map((item,i)=>(<div key={i}>{i>0&&<div style={{height:1,background:"#1e1e1e"}}/>}<div onClick={item.action} onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:13}}>{item.icon}</span><span style={{fontSize:12,color:"#ccc"}}>{item.label}</span></div></div>))}
      </div>)}
    </div>
  );
};

const SectionHeader = ({title,subtitle,tip,exportLabel,headers,rows,children}) => (
  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
    <div><div style={{fontSize:14,fontWeight:600,color:"#e0e0e0",marginBottom:2,display:"flex",alignItems:"center",gap:6}}>{title}{tip&&<InfoTip id={tip}/>}</div>{subtitle&&<div style={{fontSize:12,color:"#3a3a3a"}}>{subtitle}</div>}</div>
    <div style={{display:"flex",alignItems:"center",gap:8}}>{children}{headers&&rows&&<ExportMenu label={exportLabel||title} headers={headers} rows={rows}/>}</div>
  </div>
);

const SectionToolbar = ({accentColor,onExpand}) => (
  <div style={{display:"flex",justifyContent:"center",marginTop:14}}>
    <button onClick={onExpand} onMouseEnter={e=>{e.currentTarget.style.background=accentColor+"22";e.currentTarget.style.color=accentColor;e.currentTarget.style.borderColor=accentColor+"66";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#1e1e1e";}}
      style={{width:32,height:28,borderRadius:8,border:"none",background:"transparent",color:"#444",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
  </div>
);

const ExpandModal = ({open,onClose,title,accentColor,allData,nameKey,headers,exportRows,activeTab,showChg=false}) => {
  const [exportOpen,setExportOpen]=useState(false); const exportRef=useRef();
  useEffect(()=>{ const h=e=>{if(exportRef.current&&!exportRef.current.contains(e.target))setExportOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  if(!open) return null;
  const tab=activeTab||"Sessions"; const lowerBetter=tab==="Bounce Rate"||tab==="Avg Duration";
  const getCurrent=row=>activeTab?gmv(row,tab)||0:(row.sessions||0);
  const getPrev=row=>activeTab?gmv(row,tab,"prev"):null;
  const sortedData=[...allData].sort((a,b)=>getCurrent(b)-getCurrent(a));
  const vals=sortedData.map(r=>getCurrent(r)); const maxVal=Math.max(...vals)||1; const total=vals.reduce((s,v)=>s+v,0)||1;
  const filename=title.toLowerCase().replace(/\s+/g,"_");
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:500,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:14,width:640,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.8)"}}>
        <div style={{padding:"12px 24px",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center"}}>
          <div style={{flex:1,fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.5px"}}>{title.toUpperCase()}</div>
          <div style={{display:"flex",gap:0,alignItems:"center"}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",color:"#ffffff",width:100,textAlign:"right"}}>{tab.toUpperCase()}</span>
            {activeTab&&<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",color:"#ffffff",width:72,textAlign:"right"}}>SHARE</span>}
            {activeTab&&showChg&&<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",color:"#ffffff",width:80,textAlign:"right"}}>CHANGE</span>}
          </div>
        </div>
        <div className="modal-scroll" style={{overflowY:"auto",flex:1}}>
          {sortedData.map((row,i)=>{ const current=getCurrent(row); const prev=getPrev(row); const barPct=Math.round((current/maxVal)*100); const pct=prev&&prev>0?((current-prev)/prev)*100:null; const sharePct=total>0?Math.round((current/total)*100):null; const changeColor=pct===null?"#444":pct>0?"#10b981":"#ef4444"; const sign=pct===null?"":pct>0?"+":"-";
            return (<div key={i} style={{display:"flex",alignItems:"center",padding:"10px 24px",borderBottom:"1px solid #111"}}><div style={{flex:1,fontSize:13,color:"#ccc",position:"relative",zIndex:1,paddingRight:16}}>{row[nameKey]}</div><div style={{display:"flex",position:"relative",zIndex:1,alignItems:"center"}}><span style={{fontSize:13,fontWeight:600,color:"#fff",width:100,textAlign:"right"}}>{activeTab?fm(current,tab):current.toLocaleString()}</span>{activeTab&&<span style={{fontSize:12,fontWeight:500,color:"#666",width:72,textAlign:"right"}}>{sharePct!==null?`${sharePct}%`:"--"}</span>}{showChg&&pct!==null&&<span style={{fontSize:12,fontWeight:600,color:changeColor,width:80,textAlign:"right"}}>{sign}{Math.abs(pct).toFixed(1)}%</span>}{showChg&&pct===null&&activeTab&&<span style={{width:80}}/>}</div></div>);
          })}
        </div>
        <div style={{padding:"12px 24px",borderTop:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:11,color:"#333"}}>{allData.length} entries</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={onClose} style={{background:"transparent",border:"1px solid #444",borderRadius:8,color:"#e0e0e0",fontSize:13,padding:"8px 24px",cursor:"pointer",fontFamily:"inherit"}}>Close</button>
            <div ref={exportRef} style={{position:"relative"}}>
              <button onClick={()=>setExportOpen(o=>!o)} style={{background:"transparent",border:"1px solid #fff",borderRadius:8,color:"#fff",fontSize:16,width:34,height:34,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>↓</button>
              {exportOpen&&(<div style={{position:"absolute",bottom:"calc(100% + 8px)",right:0,background:"#141414",border:"1px solid #222",borderRadius:8,overflow:"hidden",minWidth:90,boxShadow:"0 8px 24px rgba(0,0,0,.6)",zIndex:10}}>
                {[{icon:null,iconEl:"csv",label:"Export as CSV",action:()=>{ const blob=new Blob([toCSV(headers,exportRows)],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename+".csv";a.click();URL.revokeObjectURL(url);}},{icon:null,iconEl:"excel",label:"Export as Excel",action:()=>downloadExcel(filename,headers,exportRows)},{icon:null,iconEl:"sheets",label:"Open in Google Sheets",action:()=>{openSheetsFromCSV(toCSV(headers,exportRows));}}].map((item,j)=>(<div key={j} onClick={()=>{item.action();setExportOpen(false);}} onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",borderBottom:j<2?"1px solid #1e1e1e":"none"}}><span style={{fontSize:12,color:"#ccc"}}>{item.iconEl==="csv"?"CSV":item.iconEl==="excel"?"Excel":"Sheets"}</span></div>))}
              </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({children,style={}}) => <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,display:"flex",flexDirection:"column",...style}}>{children}</div>;
const CardHead = ({title,sub,tip,right}) => <div style={{padding:"14px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{fontSize:13,fontWeight:600,color:text,display:"flex",alignItems:"center",gap:5}}>{title}{tip&&<InfoTip id={tip}/>}</div>{sub&&<div style={{fontSize:11,color:textMuted,marginTop:2}}>{sub}</div>}</div>{right}</div>;
const Body = ({children,style={}}) => <div style={{padding:"12px 16px 14px",...style}}>{children}</div>;
const Sep = () => <div style={{height:1,background:border,margin:"2px 0"}}/>;

const Chg = ({cur,prev,tab}) => {
  if(!prev||prev===0) return null;
  const pct = ((cur-prev)/prev)*100;
  const pos = tab==="Bounce Rate"||tab==="Avg Duration" ? pct<=0 : pct>=0;
  const col = pos?"#34d399":"#f87171";
  return <span style={{fontSize:10,fontWeight:600,color:col,marginLeft:4}}>{pct>=0?"+":""}{pct.toFixed(1)}%</span>;
};

const TabRow = ({tabs,active,onChange}) => (
  <div style={{display:"flex",background:surface,borderRadius:7,padding:2,gap:1}}>
    {tabs.map(([k,l])=>(
      <button key={k} onClick={()=>onChange(k)}
        style={{fontSize:11,padding:"3px 9px",borderRadius:5,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:500,transition:"all .15s",
          background:active===k?borderMid:"transparent",color:active===k?text:textDim}}>
        {l}
      </button>
    ))}
  </div>
);

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({open,onClose,children}) => {
  if(!open) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:card,border:`1px solid ${borderMid}`,borderRadius:14,width:"100%",maxWidth:640,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.8)"}}>
        {children}
      </div>
    </div>
  );
};
const MHead = ({children}) => <div style={{padding:"14px 18px",borderBottom:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>{children}</div>;
const MScroll = ({children}) => <div style={{overflowY:"auto",flex:1,scrollbarWidth:"thin",scrollbarColor:`${borderBright} transparent`}}>{children}</div>;
const MRow = ({left,right,sub,accent,isHead}) => (
  <div style={{display:"flex",alignItems:"center",padding:"8px 18px",borderBottom:`1px solid ${border}`,gap:8}}>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:12,fontWeight:isHead?700:400,color:isHead?text:textMid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{left}</div>
      {sub&&<div style={{fontSize:10,color:textMuted,marginTop:1}}>{sub}</div>}
    </div>
    <div style={{fontSize:12,fontWeight:600,color:accent||text,flexShrink:0}}>{right}</div>
  </div>
);

// ─── DOWNLOAD ─────────────────────────────────────────────────────────────────
const downloadCSV = (rows,filename) => {
  if(!rows||!rows.length) return;
  const keys=Object.keys(rows[0]);
  const body=rows.map(r=>keys.map(k=>{const v=r[k];const s=v==null?"":String(v);return s.includes(",")?`"${s}"`:s;}).join(",")).join("\n");
  const blob=new Blob([keys.join(",")+"\n"+body],{type:"text/csv"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
};
const downloadXLSX = (rows,filename) => {
  if(!rows||!rows.length) return;
  const keys=Object.keys(rows[0]);
  const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const hdr=`<Row>${keys.map(k=>`<Cell><Data ss:Type="String">${esc(k)}</Data></Cell>`).join("")}</Row>`;
  const bdy=rows.map(r=>`<Row>${keys.map(k=>`<Cell><Data ss:Type="String">${esc(r[k]??"")}</Data></Cell>`).join("")}</Row>`).join("");
  const xml=`<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table>${hdr}${bdy}</Table></Worksheet></Workbook>`;
  const blob=new Blob([xml],{type:"application/vnd.ms-excel"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename.replace(".csv",".xls"); a.click(); URL.revokeObjectURL(url);
};
const openGoogleSheets = rows => {
  if(!rows||!rows.length) return;
  const keys=Object.keys(rows[0]);
  const tsv=[keys,...rows.map(r=>keys.map(k=>r[k]??""))].map(r=>r.join("\t")).join("\n");
  const writeAndOpen=()=>{ window.open("https://sheets.new","_blank"); alert("Data copied to clipboard!\nPaste with Cmd/Ctrl+V into the new sheet."); };
  const fallbackCopy=()=>{ try{const el=document.createElement("textarea");el.value=tsv;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);}catch(e){} };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(tsv).then(writeAndOpen).catch(()=>{ fallbackCopy(); writeAndOpen(); });
  } else { fallbackCopy(); writeAndOpen(); }
};
const openSheetsFromCSV = csvText => {
  const openNew=()=>{ window.open('https://sheets.new','_blank'); alert('Data copied!\nPaste with Cmd/Ctrl+V into the new sheet.'); };
  const fb=()=>{ try{const el=document.createElement('textarea');el.value=csvText;document.body.appendChild(el);el.select();document.execCommand('copy');document.body.removeChild(el);}catch(e){} };
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(csvText).then(openNew).catch(()=>{fb();openNew();}); } else { fb(); openNew(); }
};

const DownloadBtn = ({getRows,filename}) => {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const opts=[
    {label:"CSV",    action:()=>{downloadCSV(getRows(),filename);setOpen(false);}},
    {label:"Excel",  action:()=>{downloadXLSX(getRows(),filename);setOpen(false);}},
    {label:"Sheets", action:()=>{openGoogleSheets(getRows());setOpen(false);}},
  ];
  return (
    <div ref={ref} style={{position:"relative",flexShrink:0}}>
      <button onClick={()=>setOpen(o=>!o)}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.12)";}}
        onMouseLeave={e=>{e.currentTarget.style.background=open?"rgba(255,255,255,.12)":"transparent";}}
        style={{background:open?"rgba(255,255,255,.12)":"transparent",border:"1px solid #ffffff",borderRadius:8,color:"#ffffff",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s"}}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3v13M7 11l5 5 5-5"/><path d="M3 20h18"/></svg>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#1c1c1f",border:`1px solid ${borderMid}`,borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,.6)",zIndex:200,overflow:"hidden",padding:4,display:"flex",flexDirection:"column",gap:2}}>
          {opts.map((o,i)=>(
            <button key={i} onClick={o.action}
              onMouseEnter={e=>e.currentTarget.style.background="#27272a"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              style={{display:"flex",alignItems:"center",padding:"7px 10px",background:"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",color:textMid,fontSize:11,fontWeight:500,textAlign:"left",transition:"background .1s",borderRadius:6,whiteSpace:"nowrap"}}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MColHdrs = ({left,getRows,filename}) => (
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    {getRows&&<DownloadBtn getRows={getRows} filename={filename}/>}
    <div style={{display:"flex",gap:8,padding:"6px 18px",borderBottom:`1px solid ${border}`}}>
      <span style={{flex:1,fontSize:10,fontWeight:700,color:textMuted,letterSpacing:"0.5px"}}>{left}</span>
      <span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:56,textAlign:"right"}}>SHARE</span>
    </div>
  </div>
);

// ─── TRAFFIC CHANNELS ─────────────────────────────────────────────────────────
const DonutExpandModal = ({open,onClose,title,data,accentColor="#10b981",activeTab="Sessions",showChg=false}) => {
  const [exportOpen,setExportOpen]=useState(false); const exportRef=useRef();
  useEffect(()=>{ const h=e=>{if(exportRef.current&&!exportRef.current.contains(e.target))setExportOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  if(!open) return null;
  const hasValues=data.some(d=>d.sessions!==undefined);
  const filename=title.toLowerCase().replace(/\s+/g,"_");
  const metricLabel=hasValues?activeTab.toUpperCase():"VALUE";
  const headers=["Name",metricLabel,"SHARE"];
  const exportRows=data.map(d=>[d.name,hasValues?d.sessions.toLocaleString():d.value,`${d.value}%`]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:14,width:560,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.8)"}}>
        <div style={{padding:"12px 24px",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center"}}>
          <div style={{flex:1,fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.5px"}}>{title.toUpperCase()}</div>
          <div style={{display:"flex",gap:0}}>
            {hasValues&&<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",color:"#ffffff",width:100,textAlign:"right"}}>{metricLabel}</span>}
            <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",color:"#ffffff",width:72,textAlign:"right"}}>SHARE</span>
            {hasValues&&showChg&&<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.8px",color:"#ffffff",width:80,textAlign:"right"}}>CHANGE</span>}
          </div>
        </div>
        <div className="modal-scroll" style={{overflowY:"auto",flex:1}}>
          {[...data].sort((a,b)=>(hasValues?b.sessions:b.value)-(hasValues?a.sessions:a.value)).map((row,i)=>{ const val=hasValues?row.sessions:row.value; const pct=row.value; const barW=Math.round((val/(hasValues?Math.max(...data.map(d=>d.sessions)):100))*100);
            return (<div key={i} style={{display:"flex",alignItems:"center",padding:"11px 24px",borderBottom:"1px solid #111"}}><div style={{display:"flex",alignItems:"center",gap:8,flex:1,position:"relative",zIndex:1,paddingRight:16}}><span style={{fontSize:13,color:"#ccc"}}>{row.name}</span></div><div style={{display:"flex",position:"relative",zIndex:1,alignItems:"center"}}>{hasValues&&<span style={{fontSize:13,fontWeight:600,color:"#fff",width:100,textAlign:"right"}}>{val.toLocaleString()}</span>}<span style={{fontSize:12,fontWeight:500,color:"#666",width:72,textAlign:"right"}}>{pct}%</span>{hasValues&&showChg&&(()=>{const chg=row.prevSessions&&row.prevSessions>0?((row.sessions-row.prevSessions)/row.prevSessions)*100:null;return chg!==null?<span style={{fontSize:12,fontWeight:600,color:chg>=0?"#10b981":"#ef4444",width:80,textAlign:"right"}}>{chg>=0?"+":""}{chg.toFixed(1)}%</span>:<span style={{width:80}}/>;})()}</div></div>);
          })}
        </div>
        <div style={{padding:"12px 24px",borderTop:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:11,color:"#333"}}>{data.length} entries</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={onClose} style={{background:"transparent",border:"1px solid #444",borderRadius:8,color:"#e0e0e0",fontSize:13,padding:"8px 24px",cursor:"pointer",fontFamily:"inherit"}}>Close</button>
            <div ref={exportRef} style={{position:"relative"}}>
              <button onClick={()=>setExportOpen(o=>!o)} style={{background:"transparent",border:"1px solid #fff",borderRadius:8,color:"#fff",fontSize:16,width:34,height:34,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>↓</button>
              {exportOpen&&(<div style={{position:"absolute",bottom:"calc(100% + 8px)",right:0,background:"#141414",border:"1px solid #222",borderRadius:8,overflow:"hidden",minWidth:90,boxShadow:"0 8px 24px rgba(0,0,0,.6)",zIndex:10}}>
                {[{icon:null,iconEl:"csv",label:"Export as CSV",action:()=>{const blob=new Blob([toCSV(headers,exportRows)],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename+".csv";a.click();URL.revokeObjectURL(url);}},{icon:null,iconEl:"excel",label:"Export as Excel",action:()=>downloadExcel(filename,headers,exportRows)},{icon:null,iconEl:"sheets",label:"Open in Google Sheets",action:()=>{openSheetsFromCSV(toCSV(headers,exportRows));}}].map((item,j)=>(<div key={j} onClick={()=>{item.action();setExportOpen(false);}} onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",borderBottom:j<2?"1px solid #1e1e1e":"none"}}><span style={{fontSize:12,color:"#ccc"}}>{item.iconEl==="csv"?"CSV":item.iconEl==="excel"?"Excel":"Sheets"}</span></div>))}
              </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrafficChannelsCard = ({data,activeTab="Sessions",showChg=false}) => {
  const [expandOpen,setExpandOpen]=useState(false);
  const [hoveredIdx,setHoveredIdx]=useState(null);
  const maxVal=Math.max(...data.map(d=>d.value));
  return (
    <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:20,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{fontSize:14,fontWeight:600,color:"#e0e0e0"}}>Traffic Channels</div><InfoTip id="Traffic Channels"/></div>
        <button onClick={()=>setExpandOpen(true)} onMouseEnter={e=>e.currentTarget.style.color="#888"} onMouseLeave={e=>e.currentTarget.style.color="#333"} style={{background:"transparent",border:"none",borderRadius:6,color:"#444",padding:"2px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:9}}>
        {data.map((d,i)=>(
          <div key={i} onMouseEnter={()=>setHoveredIdx(i)} onMouseLeave={()=>setHoveredIdx(null)} style={{cursor:"default"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                
                <span style={{fontSize:12,color:hoveredIdx===i?"#ccc":"#666",transition:"color 0.15s"}}>{d.name}</span>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:hoveredIdx===i?"#fff":"#999",transition:"color 0.15s"}}>
                {hoveredIdx===i?d.sessions.toLocaleString():`${d.value}%`}
              </span>
            </div>
            <div style={{height:4,borderRadius:2,background:"#1a1a1a",overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:2,background:d.color,width:`${Math.round((d.value/maxVal)*100)}%`,opacity:hoveredIdx===null||hoveredIdx===i?1:0.25,transition:"opacity 0.15s"}}/>
            </div>
          </div>
        ))}
      </div>
      <DonutExpandModal open={expandOpen} onClose={()=>setExpandOpen(false)} title="Traffic Channels" data={data} accentColor="#e4e4e7" activeTab={activeTab} showChg={showChg}/>
    </div>
  );
};

const ReferrersCard = ({onExpand,activeTab="Sessions",referrerData:refD=referrerData,utmData:utmD=utmData,showChg=false}) => {
  const [refTab,setRefTab]=useState("Referrers");
  const [hoveredIdx,setHoveredIdx]=useState(null);
  const activeData=refTab==="Referrers"?refD:utmD;
  const totalAll=activeData.reduce((s,r)=>s+r.visitors,0);
  return (
    <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:20,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex"}}>
          {["Referrers","UTM Parameters"].map(t=>(<span key={t} style={{display:"inline-flex",alignItems:"center",gap:5,marginRight:20}}><button onClick={()=>setRefTab(t)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:600,padding:"0",color:refTab===t?"#e0e0e0":"#444",transition:"all 0.15s"}}>{t}</button>{refTab===t&&<InfoTip id={t}/>}</span>))}
        </div>
        <button onClick={onExpand} onMouseEnter={e=>e.currentTarget.style.color="#888"} onMouseLeave={e=>e.currentTarget.style.color="#333"} style={{background:"transparent",border:"none",borderRadius:6,color:"#444",padding:"2px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
      </div>
      <div style={{flex:1}}>
        {activeData.slice(0,6).map((row,i)=>{
          const barW=totalAll>0?Math.round((row.visitors/totalAll)*100):0;
          const isUTM=refTab==="UTM Parameters";
          const hovered=hoveredIdx===i;
          const valStr=row.visitors>=1000?(row.visitors/1000).toFixed(1)+"K":row.visitors.toLocaleString();
          const pctStr=totalAll>0?`${Math.round((row.visitors/totalAll)*100)}%`:"--";
          return (
            <div key={i} onMouseEnter={()=>setHoveredIdx(i)} onMouseLeave={()=>setHoveredIdx(null)} style={{padding:"8px 0",borderBottom:i<5?"1px solid #141414":"none",cursor:"default"}}>
              <div style={{display:"flex",alignItems:"center",marginBottom:5}}>
                <span style={{flex:1,fontSize:isUTM?11:12,color:hovered?"#ccc":"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:12,fontFamily:isUTM?"monospace":"inherit",transition:"color 0.15s"}}>{row.name}</span>
                <span style={{fontSize:13,fontWeight:700,color:hovered?"#fff":"#999",flexShrink:0,minWidth:48,textAlign:"right",transition:"color 0.15s"}}>{hovered?pctStr:valStr}</span>
              </div>
              <div style={{height:3,borderRadius:2,background:"#1a1a1a",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${barW}%`,background:"#e4e4e7",borderRadius:2,opacity:hoveredIdx===null||hovered?1:0.25,transition:"opacity 0.15s"}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReferrersModal = ({open,onClose,activeTab="Sessions",referrerData:refMD=referrerData,utmData:utmMD=utmData,showChg=false}) => {
  const [refTab,setRefTab]=useState("Referrers");
  const [exportOpen,setExportOpen]=useState(false); const exportRef=useRef();
  useEffect(()=>{ const h=e=>{if(exportRef.current&&!exportRef.current.contains(e.target))setExportOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  if(!open) return null;
  const activeData=refTab==="Referrers"?refMD:utmMD;
  const isUTM=refTab==="UTM Parameters";
  const headers=[isUTM?"UTM Parameter":"Referrer","Visitors"];
  const rows=activeData.map(r=>[r.name,r.visitors]);
  const filename=refTab.toLowerCase().replace(/ /g,"_");
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:14,width:640,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.8)"}}>
        <div style={{padding:"18px 24px 0",borderBottom:"1px solid #1a1a1a"}}>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
            <div style={{display:"flex"}}>
              {["Referrers","UTM Parameters"].map(t=>(<button key={t} onClick={()=>setRefTab(t)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:600,padding:"0 0 14px",marginRight:20,color:refTab===t?"#e0e0e0":"#444",transition:"all 0.15s"}}>{t}</button>))}
            </div>
            <div style={{display:"flex",gap:0,paddingBottom:14}}>
              <span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:100,textAlign:"right"}}>VISITORS</span>
              <span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:72,textAlign:"right"}}>SHARE</span>
              {showChg&&<span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:80,textAlign:"right"}}>CHANGE</span>}
            </div>
          </div>
        </div>
        <div className="modal-scroll" style={{overflowY:"auto",flex:1}}>
          {(()=>{
            const totalAll=activeData.reduce((s,r)=>s+r.visitors,0);
            return activeData.map((row,i)=>{
              const barW=totalAll>0?Math.round((row.visitors/totalAll)*100):0;
              const valStr=row.visitors>=1000?(row.visitors/1000).toFixed(1)+"K":row.visitors.toLocaleString();
              const pctStr=`${Math.round((row.visitors/totalAll)*100)}%`;
              return (
                <div key={i} style={{padding:"10px 24px",borderBottom:"1px solid #141414",cursor:"default",display:"flex",alignItems:"center"}}>
                  <span style={{flex:1,fontSize:isUTM?11:12,color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:16,fontFamily:isUTM?"monospace":"inherit"}}>{row.name}</span>
                  <span style={{fontSize:13,fontWeight:600,color:"#fff",width:100,textAlign:"right"}}>{valStr}</span>
                  <span style={{fontSize:12,fontWeight:500,color:"#666",width:72,textAlign:"right"}}>{pctStr}</span>
                  {showChg&&(()=>{const chg=row.prevVisitors&&row.prevVisitors>0?((row.visitors-row.prevVisitors)/row.prevVisitors)*100:null;return chg!==null?<span style={{fontSize:12,fontWeight:600,color:chg>=0?"#10b981":"#ef4444",width:80,textAlign:"right"}}>{chg>=0?"+":""}{chg.toFixed(1)}%</span>:<span style={{width:80}}/>;})()}
                </div>
              );
            });
          })()}
        </div>
        <div style={{padding:"12px 24px",borderTop:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:11,color:"#333"}}>{activeData.length} entries</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={onClose} style={{background:"transparent",border:"1px solid #444",borderRadius:8,color:"#e0e0e0",fontSize:13,padding:"8px 24px",cursor:"pointer",fontFamily:"inherit"}}>Close</button>
            <div ref={exportRef} style={{position:"relative"}}>
              <button onClick={()=>setExportOpen(o=>!o)} style={{background:"transparent",border:"1px solid #fff",borderRadius:8,color:"#fff",fontSize:16,width:34,height:34,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>↓</button>
              {exportOpen&&(<div style={{position:"absolute",bottom:"calc(100% + 8px)",right:0,background:"#141414",border:"1px solid #222",borderRadius:8,overflow:"hidden",minWidth:90,boxShadow:"0 8px 24px rgba(0,0,0,.6)",zIndex:10}}>
                {[{icon:null,iconEl:"csv",label:"Export as CSV",action:()=>{const blob=new Blob([toCSV(headers,rows)],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename+".csv";a.click();URL.revokeObjectURL(url);}},{icon:null,iconEl:"excel",label:"Export as Excel",action:()=>downloadExcel(filename,headers,rows)},{icon:null,iconEl:"sheets",label:"Open in Google Sheets",action:()=>{openSheetsFromCSV(toCSV(headers,rows));}}].map((item,j)=>(<div key={j} onClick={()=>{item.action();setExportOpen(false);}} onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",borderBottom:j<2?"1px solid #1e1e1e":"none"}}><span style={{fontSize:12,color:"#ccc"}}>{item.iconEl==="csv"?"CSV":item.iconEl==="excel"?"Excel":"Sheets"}</span></div>))}
              </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DONUT ────────────────────────────────────────────────────────────────────
const DonutCard = ({title,sub,data,fn:fmtFn,showChg=false}) => {
  const [hov,setHov]=useState(null);
  const [expand,setExpand]=useState(false);
  const e=hov!==null?data[hov]:data[0];
  const total=data.reduce((s,d)=>s+(d.sessions||0),0);
  return (
    <Card>
      <CardHead title={title} tip={title}
        right={<button onClick={()=>setExpand(true)} style={{background:"transparent",border:"none",borderRadius:6,color:"#444",padding:"2px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>}/>
      <Body style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,paddingTop:8}}>
        <div style={{position:"relative",width:200,height:200,flexShrink:0}} onMouseLeave={()=>setHov(null)}>
          <PieChart width={200} height={200} margin={{top:0,right:0,bottom:0,left:0}} style={{display:"block"}}>
            <Pie data={data} cx={100} cy={100} innerRadius={80} outerRadius={94} dataKey="value"
              paddingAngle={3} cornerRadius={7} minAngle={10}
              startAngle={90} endAngle={-270}
              onMouseEnter={(_,i)=>setHov(i)} onMouseLeave={()=>setHov(null)}>
              {data.map((d,i)=><Cell key={i} fill={d.color} opacity={hov===null||hov===i?1:0.2} strokeWidth={0}/>)}
            </Pie>
          </PieChart>
          <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"grid",placeItems:"center",pointerEvents:"none"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:"#f4f4f5",lineHeight:1}}>{e.value}%</div>
              <div style={{fontSize:11,color:textDim,marginTop:5,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px",width:"100%"}}>
          {data.map((d,i)=>(
            <div key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
              style={{display:"flex",alignItems:"center",gap:5,cursor:"default",opacity:hov===null||hov===i?1:0.4,transition:"opacity .15s"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:d.color,flexShrink:0}}/>
              <span style={{fontSize:10,color:textDim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0,flex:1}}>{d.name}</span>
              <span style={{fontSize:10,fontWeight:600,color:textMid,flexShrink:0,marginLeft:2}}>{fmtFn?fmtFn(d):fn(d.sessions||0)}</span>
            </div>
          ))}
        </div>
      </Body>
      <Modal open={expand} onClose={()=>setExpand(false)}>
        <MHead>
          <span style={{fontSize:14,fontWeight:600,color:text}}>{title}</span>
          <button onClick={()=>setExpand(false)} style={{background:"transparent",border:"none",color:textMuted,cursor:"pointer",fontSize:16}}>✕</button>
        </MHead>
        <div style={{padding:"8px 18px",borderBottom:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:10,fontWeight:700,color:textMuted,letterSpacing:"0.5px"}}>NAME</span>
          <DownloadBtn getRows={()=>data.map(r=>({name:r.name,share:`${r.value}%`,value:r.sessions??r.value}))} filename={`${title.replace(/\s+/g,"-").toLowerCase()}.csv`}/>
        </div>
        <MScroll>{data.map((r,i)=><MRow key={i} left={r.name} right={`${r.value}%`} sub={fn(r.sessions||0)} accent={r.color}/>)}</MScroll>
      </Modal>
    </Card>
  );
};

const EventsCard = ({eventData:evtData=eventData,showChg=false}) => {
  const [expandOpen,setExpandOpen]=useState(false);
  const [exportOpen,setExportOpen]=useState(false); const exportRef=useRef();
  useEffect(()=>{ const h=e=>{if(exportRef.current&&!exportRef.current.contains(e.target))setExportOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const top5=evtData.slice(0,5); const total=top5.reduce((s,r)=>s+r.count,0);
  const fmt=n=>n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(0)+"K":n.toString();
  return (
    <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:20,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{fontSize:14,fontWeight:600,color:"#e0e0e0"}}>Events</div><InfoTip id="Events"/></div>
        <button onClick={()=>setExpandOpen(true)} onMouseEnter={e=>e.currentTarget.style.color="#888"} onMouseLeave={e=>e.currentTarget.style.color="#333"} style={{background:"transparent",border:"none",borderRadius:6,color:"#444",padding:"2px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
      </div>
      <div style={{flex:1}}>
        {top5.map((row,i)=>{ const barW=Math.round((row.count/total)*100); return (
          <div key={i} onMouseEnter={e=>{e.currentTarget.querySelector(".ev-label").style.color="#ccc";e.currentTarget.querySelector(".ev-val").style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.querySelector(".ev-label").style.color="#888";e.currentTarget.querySelector(".ev-val").style.color="#999";}} style={{padding:"7px 0",borderBottom:i<5?"1px solid #141414":"none",cursor:"default"}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:4}}>
              <span className="ev-label" style={{flex:1,fontSize:12,color:"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"color 0.15s"}}>{row.name}</span>
              <span className="ev-val" style={{fontSize:13,fontWeight:700,color:"#999",flexShrink:0,transition:"color 0.15s",marginRight:8}}>{fmt(row.count)}</span>
              {showChg&&row.prev&&<span style={{fontSize:11,fontWeight:600,color:row.count>=row.prev?"#10b981":"#ef4444",flexShrink:0,minWidth:44,textAlign:"right"}}>{row.count>=row.prev?"+":""}{(((row.count-row.prev)/row.prev)*100).toFixed(1)}%</span>}
            </div>
            <div style={{height:2,borderRadius:2,background:"#1a1a1a",overflow:"hidden"}}><div style={{height:"100%",width:`${barW}%`,background:"#e4e4e7",borderRadius:2}}/></div>
          </div>
        );})}
      </div>
      {expandOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setExpandOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:14,width:520,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.8)"}}>
            <div style={{padding:"12px 24px",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center"}}>
              <div style={{flex:1,fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.5px"}}>EVENT</div>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:100,textAlign:"right"}}>COUNT</span>
                <span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:72,textAlign:"right"}}>SHARE</span>
                {showChg&&<span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:80,textAlign:"right"}}>CHANGE</span>}
              </div>
            </div>
            <div className="modal-scroll" style={{overflowY:"auto",flex:1}}>
              {(()=>{ const allTotal=evtData.reduce((s,r)=>s+r.count,0); const allMax=evtData[0].count;
                return [...evtData].sort((a,b)=>b.count-a.count).map((row,i)=>(<div key={i} style={{display:"flex",alignItems:"center",padding:"10px 24px",borderBottom:"1px solid #111"}}><span style={{flex:1,fontSize:13,color:"#ccc",position:"relative",zIndex:1,paddingRight:16}}>{row.name}</span><div style={{display:"flex",position:"relative",zIndex:1,alignItems:"center"}}><span style={{fontSize:13,fontWeight:600,color:"#fff",width:100,textAlign:"right"}}>{fmt(row.count)}</span><span style={{fontSize:12,fontWeight:500,color:"#666",width:72,textAlign:"right"}}>{Math.round(row.count/allTotal*100)}%</span>{showChg&&row.prev&&<span style={{fontSize:12,fontWeight:600,color:row.count>=row.prev?"#10b981":"#ef4444",width:72,textAlign:"right"}}>{row.count>=row.prev?"+":""}{(((row.count-row.prev)/row.prev)*100).toFixed(1)}%</span>}{showChg&&!row.prev&&<span style={{width:72}}/>}</div></div>));
              })()}
            </div>
            <div style={{padding:"12px 24px",borderTop:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:"#333"}}>{eventData.length} events</span>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>setExpandOpen(false)} style={{background:"transparent",border:"1px solid #444",borderRadius:8,color:"#e0e0e0",fontSize:13,padding:"8px 24px",cursor:"pointer",fontFamily:"inherit"}}>Close</button>
                <div ref={exportRef} style={{position:"relative"}}>
                  <button onClick={()=>setExportOpen(o=>!o)} style={{background:"transparent",border:"1px solid #fff",borderRadius:8,color:"#fff",fontSize:16,width:34,height:34,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>↓</button>
                  {exportOpen&&(<div style={{position:"absolute",bottom:"calc(100% + 8px)",right:0,background:"#141414",border:"1px solid #222",borderRadius:8,overflow:"hidden",minWidth:90,boxShadow:"0 8px 24px rgba(0,0,0,.6)",zIndex:10}}>
                    {[{icon:null,iconEl:"csv",label:"Export as CSV",action:()=>{const allTotal=eventData.reduce((s,x)=>s+x.count,0);const rows=eventData.map(r=>[r.name,r.count,Math.round(r.count/allTotal*100)+"%"]);const blob=new Blob([toCSV(["Event","Count","Share"],rows)],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="events.csv";a.click();URL.revokeObjectURL(url);}},{icon:null,iconEl:"excel",label:"Export as Excel",action:()=>{const allTotal=eventData.reduce((s,x)=>s+x.count,0);downloadExcel("events",["Event","Count","Share"],eventData.map(r=>[r.name,r.count,Math.round(r.count/allTotal*100)+"%"]));}},{icon:null,iconEl:"sheets",label:"Open in Google Sheets",action:()=>{const allTotal=eventData.reduce((s,x)=>s+x.count,0);const rows=eventData.map(r=>[r.name,r.count,Math.round(r.count/allTotal*100)+"%"]);openSheetsFromCSV(toCSV(["Event","Count","Share"],rows));}}].map((item,j)=>(<div key={j} onClick={()=>{item.action();setExportOpen(false);}} onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",borderBottom:j<2?"1px solid #1e1e1e":"none"}}><span style={{fontSize:12,color:"#ccc"}}>{item.iconEl==="csv"?"CSV":item.iconEl==="excel"?"Excel":"Sheets"}</span></div>))}
                  </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OsBrowserCard = ({activeTab="Sessions",osData:osD=osData,browserData:brD=browserData,showChg=false}) => {
  const [tab,setTab]=useState("OS");
  const [hoveredIdx,setHoveredIdx]=useState(null);
  const [expandOpen,setExpandOpen]=useState(false);
  const [exportOpen,setExportOpen]=useState(false); const exportRef=useRef();
  useEffect(()=>{ const h=e=>{if(exportRef.current&&!exportRef.current.contains(e.target))setExportOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const activeData=tab==="OS"?osD:brD;
  const accentColor="#e4e4e7";
  const metricTotal=MT[activeTab]||1629696;
  return (
    <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:20,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex"}}>
          {["OS","Browser"].map(t=>(<span key={t} style={{display:"inline-flex",alignItems:"center",gap:5,marginRight:20}}><button onClick={()=>{setTab(t);setHoveredIdx(null);}} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:14,fontWeight:600,padding:"0",color:tab===t?"#e0e0e0":"#444",transition:"all 0.15s"}}>{t==="OS"?"Operating Systems":"Browsers"}</button>{tab===t&&<InfoTip id={t==="OS"?"Operating Systems":"Browsers"}/>}</span>))}
        </div>
        <button onClick={()=>setExpandOpen(true)} onMouseEnter={e=>e.currentTarget.style.color="#888"} onMouseLeave={e=>e.currentTarget.style.color="#333"} style={{background:"transparent",border:"none",borderRadius:6,color:"#444",padding:"2px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
      </div>
      <div style={{flex:1}}>
        {activeData.map((row,i)=>{ const hovered=hoveredIdx===i; const metricVal=Math.round(row.value/100*metricTotal); return (
          <div key={i} onMouseEnter={()=>setHoveredIdx(i)} onMouseLeave={()=>setHoveredIdx(null)} style={{padding:"8px 0",borderBottom:i<activeData.length-1?"1px solid #141414":"none",cursor:"default"}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:5}}>
              <span style={{flex:1,fontSize:12,color:hovered?"#ccc":"#888",transition:"color 0.15s"}}>{row.name}</span>
              <span style={{fontSize:13,fontWeight:700,color:hovered?"#fff":"#999",transition:"color 0.15s",marginRight:8}}>{hovered?`${row.value}%`:fn(metricVal)}</span>
              {showChg&&row.prevValue!=null&&(()=>{const chg=row.value-row.prevValue;return <span style={{fontSize:11,fontWeight:600,color:chg>=0?"#10b981":"#ef4444",flexShrink:0,minWidth:44,textAlign:"right"}}>{chg>=0?"+":""}{chg.toFixed(1)}pp</span>;})()}
            </div>
            <div style={{height:3,borderRadius:2,background:"#1a1a1a",overflow:"hidden"}}><div style={{height:"100%",width:`${row.value}%`,background:accentColor,borderRadius:2,opacity:hoveredIdx===null||hovered?1:0.25,transition:"opacity 0.15s"}}/></div>
          </div>
        );})}
      </div>
      {expandOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setExpandOpen(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#0f0f0f",border:"1px solid #1e1e1e",borderRadius:14,width:520,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,.8)"}}>
            <div style={{padding:"12px 24px",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center"}}>
              <div style={{flex:1,fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.5px"}}>{tab==="OS"?"OS":"BROWSER"}</div>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:100,textAlign:"right"}}>{activeTab.toUpperCase()}</span>
                <span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:72,textAlign:"right"}}>SHARE</span>
                {showChg&&<span style={{fontSize:10,fontWeight:700,color:"#ffffff",letterSpacing:"0.8px",width:80,textAlign:"right"}}>CHANGE</span>}
              </div>
            </div>
            <div className="modal-scroll" style={{overflowY:"auto",flex:1}}>
              {[...activeData].sort((a,b)=>b.value-a.value).map((row,i)=>{ const val=Math.round(row.value/100*metricTotal); return (
                <div key={i} style={{display:"flex",alignItems:"center",padding:"10px 24px",borderBottom:"1px solid #111"}}><span style={{flex:1,fontSize:13,color:"#ccc",position:"relative",zIndex:1,paddingRight:16}}>{row.name}</span><div style={{display:"flex",position:"relative",zIndex:1,alignItems:"center"}}><span style={{fontSize:13,fontWeight:600,color:"#fff",width:100,textAlign:"right"}}>{fn(val)}</span><span style={{fontSize:12,fontWeight:500,color:"#666",width:72,textAlign:"right"}}>{row.value}%</span>{showChg&&row.prevValue!=null&&(()=>{const chg=row.value-row.prevValue;return <span style={{fontSize:12,fontWeight:600,color:chg>=0?"#10b981":"#ef4444",width:72,textAlign:"right"}}>{chg>=0?"+":""}{chg.toFixed(1)}pp</span>;})()}{showChg&&row.prevValue==null&&<span style={{width:72}}/>}</div></div>
              );})}
            </div>
            <div style={{padding:"12px 24px",borderTop:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:"#333"}}>{activeData.length} entries</span>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setExpandOpen(false)} style={{background:"transparent",border:"1px solid #444",borderRadius:8,color:"#e0e0e0",fontSize:13,padding:"8px 24px",cursor:"pointer",fontFamily:"inherit"}}>Close</button>
                <div ref={exportRef} style={{position:"relative"}}>
                  <button onClick={()=>setExportOpen(o=>!o)} style={{background:"transparent",border:"1px solid #fff",borderRadius:8,color:"#fff",fontSize:16,width:34,height:34,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}>↓</button>
                  {exportOpen&&(<div style={{position:"absolute",bottom:"calc(100% + 8px)",right:0,background:"#141414",border:"1px solid #222",borderRadius:8,overflow:"hidden",minWidth:90,boxShadow:"0 8px 24px rgba(0,0,0,.6)",zIndex:10}}>
                    {[{icon:null,iconEl:"csv",label:"Export as CSV",action:()=>{const rows=activeData.map(r=>[r.name,fn(Math.round(r.value/100*metricTotal)),r.value+"%"]);const blob=new Blob([toCSV(["Name",activeTab,"Share%"],rows)],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=tab.toLowerCase()+".csv";a.click();URL.revokeObjectURL(url);}},{icon:null,iconEl:"excel",label:"Export as Excel",action:()=>downloadExcel(tab.toLowerCase(),["Name",activeTab,"Share%"],activeData.map(r=>[r.name,fn(Math.round(r.value/100*metricTotal)),r.value+"%"]))},{icon:null,iconEl:"sheets",label:"Open in Google Sheets",action:()=>{const rows=activeData.map(r=>[r.name,fn(Math.round(r.value/100*metricTotal)),r.value+"%"]);openSheetsFromCSV(toCSV(["Name",activeTab,"Share%"],rows));}}].map((item,j)=>(<div key={j} onClick={()=>{item.action();setExportOpen(false);}} onMouseEnter={e=>e.currentTarget.style.background="#1a1a1a"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",borderBottom:j<2?"1px solid #1e1e1e":"none"}}><span style={{fontSize:12,color:"#ccc"}}>{item.iconEl==="csv"?"CSV":item.iconEl==="excel"?"Excel":"Sheets"}</span></div>))}
                  </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── INSIGHT CARD ─────────────────────────────────────────────────────────────
const INSIGHTS = {
  Sessions: [
    { p1:{text:"Sessions hit 8.2M this period — up +18.4% vs the previous period. UK accounts for 82.9% of all traffic, with direct and organic search the dominant channels.",highlights:[{word:"8.2M",color:"#34d399"},{word:"+18.4%",color:"#34d399"}]},
      p2:{text:"chatgpt.com referrals surged +66.7% — a signal that AI-driven discovery is growing fast. Bounce rate sits at 52.4%, steady but worth watching on mobile.",highlights:[{word:"+66.7%",color:"#34d399"},{word:"52.4%",color:"#f87171"}]} },
    { p1:{text:"Session volume is up across all properties. monzo.com drives 81.4% of total sessions, with community.monzo.com contributing a growing 14.8% share.",highlights:[{word:"81.4%",color:"#34d399"},{word:"14.8%",color:"#34d399"}]},
      p2:{text:"The /features/pots/ and /features/savings/ pages are top performers. Session depth on web.monzo.com averages 1.9 pages — above the network average.",highlights:[]} },
    { p1:{text:"YoY sessions have grown +59.8% from 2024 to 2026. The strongest growth spike came in Q1 2026 following the investments feature launch.",highlights:[{word:"+59.8%",color:"#34d399"}]},
      p2:{text:"Mobile sessions are at 37.4% and rising. Ensuring mobile load times stay under 2s will be critical to sustaining conversion rates.",highlights:[{word:"37.4%",color:"#34d399"}]} },
  ],
  Users: [
    { p1:{text:"Active users reached 5.9M this period — up +16.8% vs prior. 61.8% are new visitors, indicating strong top-of-funnel acquisition driven by organic channels.",highlights:[{word:"5.9M",color:"#34d399"},{word:"+16.8%",color:"#34d399"}]},
      p2:{text:"Returning users at 38.2% are stable. The web.monzo.com app sees 77.6% returning — the highest loyalty rate across all properties.",highlights:[{word:"38.2%",color:"#34d399"},{word:"77.6%",color:"#34d399"}]} },
    { p1:{text:"User growth is strongest on api.monzo.com at +19.7% YoY, reflecting rising developer adoption. community.monzo.com grew +11.0% — steady but below network average.",highlights:[{word:"+19.7%",color:"#34d399"},{word:"+11.0%",color:"#34d399"}]},
      p2:{text:"Desktop users make up 61.2% overall. Mobile user share is highest on monzo.com/help at 58.4%, pointing to in-app help-seeking behaviour.",highlights:[{word:"61.2%",color:"#34d399"},{word:"58.4%",color:"#34d399"}]} },
    { p1:{text:"The UK remains dominant with 86.9% of all users. Ireland and the US follow, each under 5% — international growth is an untapped opportunity.",highlights:[{word:"86.9%",color:"#34d399"}]},
      p2:{text:"New user volume from organic search grew +22.1% — the Monzo savings and investments pages are driving significant acquisition intent.",highlights:[{word:"+22.1%",color:"#34d399"}]} },
  ],
  Views: [
    { p1:{text:"Total page views reached 14.6M — up +21.3% YoY. monzo.com accounts for 83.2% of views, with the homepage alone pulling 2.8M views this period.",highlights:[{word:"14.6M",color:"#34d399"},{word:"+21.3%",color:"#34d399"}]},
      p2:{text:"web.monzo.com has the highest views-per-session ratio at 1.9x, driven by authenticated users navigating transactions and account screens.",highlights:[{word:"1.9x",color:"#34d399"}]} },
    { p1:{text:"The /features/ section drives 48.2% of all monzo.com views. Pots, savings, and investments pages are the top three in that cluster.",highlights:[{word:"48.2%",color:"#34d399"}]},
      p2:{text:"Blog views are up +31.3% — the machine learning and savings content is performing well in organic search. Consider expanding that content series.",highlights:[{word:"+31.3%",color:"#34d399"}]} },
    { p1:{text:"api.monzo.com views grew +24.1%, with /docs/ and /reference/ as top destinations. Developer engagement is deepening across the board.",highlights:[{word:"+24.1%",color:"#34d399"}]},
      p2:{text:"Mobile view depth is lower than desktop. Optimising the mobile reading experience on long-form pages could lift views-per-session by an estimated 12–15%.",highlights:[{word:"12–15%",color:"#34d399"}]} },
  ],
  "Avg Duration": [
    { p1:{text:"Average session duration across the network is 3m 42s — up +7.1% vs prior period. api.monzo.com leads at 6m 14s, driven by deep documentation engagement.",highlights:[{word:"3m 42s",color:"#34d399"},{word:"+7.1%",color:"#34d399"},{word:"6m 14s",color:"#34d399"}]},
      p2:{text:"web.monzo.com has the second longest duration at 5m 12s, reflecting logged-in users completing tasks. monzo.com/help duration fell -2.6% — an area to watch.",highlights:[{word:"5m 12s",color:"#34d399"},{word:"-2.6%",color:"#f87171"}]} },
    { p1:{text:"Pages with the longest dwell time are /features/investments/ (3m 38s) and /features/pots/ (4m 22s), suggesting high intent and research behaviour.",highlights:[{word:"3m 38s",color:"#34d399"},{word:"4m 22s",color:"#34d399"}]},
      p2:{text:"The /pricing/ page has a duration of just 1m 58s. A/B testing richer pricing comparisons could increase time on page and downstream conversion.",highlights:[{word:"1m 58s",color:"#f87171"}]} },
    { p1:{text:"Desktop sessions last 28% longer than mobile on average. The gap is widest on blog and API pages — likely due to reading and code-scanning behaviour.",highlights:[{word:"28%",color:"#34d399"}]},
      p2:{text:"Duration correlates strongly with conversion intent on monzo.com. Sessions over 3 minutes convert at 4.2x the rate of sub-30s sessions.",highlights:[{word:"4.2x",color:"#34d399"}]} },
  ],
  "Bounce Rate": [
    { p1:{text:"Network bounce rate is 32.3% — down 2.5pp vs prior period, a strong result. monzo.com/help has the highest bounce at 56.2%, expected for single-answer help searches.",highlights:[{word:"32.3%",color:"#34d399"},{word:"2.5pp",color:"#34d399"},{word:"56.2%",color:"#f87171"}]},
      p2:{text:"web.monzo.com has the lowest bounce at 16.4%, expected for an authenticated app. The /payments/make-payment/ page bounces at just 5.2% — the most engaged destination.",highlights:[{word:"16.4%",color:"#34d399"},{word:"5.2%",color:"#34d399"}]} },
    { p1:{text:"Mobile bounce rate is 6.4pp higher than desktop on monzo.com. Key culprits are the /about/ and /careers/ pages — both primarily informational with no clear next step.",highlights:[{word:"6.4pp",color:"#f87171"}]},
      p2:{text:"Bounce rate on organic search traffic is 54.2% — below the network average for that channel. Landing page relevance is tracking well.",highlights:[{word:"54.2%",color:"#34d399"}]} },
    { p1:{text:"Bounce on chatgpt.com referral traffic is 43.2%, below the overall referral average. This audience is engaged and worth targeting with more intent-driven content.",highlights:[{word:"43.2%",color:"#34d399"}]},
      p2:{text:"Adding clearer next-step CTAs on help pages could reduce bounce by an estimated 8–12pp, turning single-page help visits into multi-page product journeys.",highlights:[{word:"8–12pp",color:"#34d399"}]} },
  ],
};

const PROPERTY_INSIGHTS = {
  "monzo.com": {
    Sessions: { p1:{text:"monzo.com had 6.2M sessions this period — up +23.4% vs prior. The homepage and /features/pots/ drive the most traffic, with direct and organic search as the top channels.",highlights:[{word:"6.2M",color:"#34d399"},{word:"+23.4%",color:"#34d399"}]}, p2:{text:"Bounce rate sits at 34.8%, well below the network average. The /features/ section accounts for 48% of all page views and shows strong engagement depth.",highlights:[{word:"34.8%",color:"#34d399"},{word:"48%",color:"#34d399"}]} },
    Users:     { p1:{text:"monzo.com reached 4.5M users this period — up +20.1%. 64.2% are new visitors, signalling strong top-of-funnel performance from organic search.",highlights:[{word:"4.5M",color:"#34d399"},{word:"+20.1%",color:"#34d399"}]}, p2:{text:"Returning users at 35.8% are healthy for a marketing site. The /get-started/ and /switch-to-monzo/ pages are key conversion entry points.",highlights:[{word:"35.8%",color:"#34d399"}]} },
    Views:     { p1:{text:"monzo.com generated 11.3M page views — up +27.2%. The /features/ cluster drives nearly half of all views, led by pots, savings, and investments.",highlights:[{word:"11.3M",color:"#34d399"},{word:"+27.2%",color:"#34d399"}]}, p2:{text:"Views per session average 1.82x. Pages with the deepest engagement are /features/investments/ and /features/pots/, both averaging over 4 minutes on page.",highlights:[{word:"1.82x",color:"#34d399"}]} },
    "Avg Duration": { p1:{text:"Average session duration on monzo.com is 3m 58s — up +8.2% vs prior. Feature pages dominate, with /features/pots/ at 4m 22s the top performer.",highlights:[{word:"3m 58s",color:"#34d399"},{word:"+8.2%",color:"#34d399"}]}, p2:{text:"The /pricing/ and /about/ pages have the shortest dwell times at under 2 minutes — both could benefit from stronger CTAs to extend engagement.",highlights:[{word:"2 minutes",color:"#f87171"}]} },
    "Bounce Rate": { p1:{text:"monzo.com bounce rate is 34.8% — down from 37.2% in the prior period. The /download/ page has the lowest bounce at 20.4%, reflecting high conversion intent.",highlights:[{word:"34.8%",color:"#34d399"},{word:"20.4%",color:"#34d399"}]}, p2:{text:"The /about/ page bounces at 39.8% and /careers/ at 37.2% — both informational pages that could be improved with deeper internal linking.",highlights:[{word:"39.8%",color:"#f87171"},{word:"37.2%",color:"#f87171"}]} },
  },
  "web.monzo.com": {
    Sessions: { p1:{text:"web.monzo.com had 1.14M sessions this period — up +18.1%. 72.4% of traffic arrives direct, consistent with an authenticated banking app.",highlights:[{word:"1.14M",color:"#34d399"},{word:"+18.1%",color:"#34d399"}]}, p2:{text:"Returning users account for 77.6% of sessions — the highest loyalty rate across all properties. Task completion on /payments/ and /pots/ is a key engagement driver.",highlights:[{word:"77.6%",color:"#34d399"}]} },
    Users:     { p1:{text:"web.monzo.com served 892K users this period — up +17.7%. The high returning rate of 77.6% reflects strong habitual usage among logged-in customers.",highlights:[{word:"892K",color:"#34d399"},{word:"+17.7%",color:"#34d399"}]}, p2:{text:"Mobile accounts for 45.8% of app web sessions. Safari is the dominant browser at 44%, consistent with iOS-heavy Monzo user demographics.",highlights:[{word:"45.8%",color:"#34d399"}]} },
    Views:     { p1:{text:"web.monzo.com generated 2.17M views — up +19.8%. Views per session average 1.90x, reflecting multi-screen task completion journeys.",highlights:[{word:"2.17M",color:"#34d399"},{word:"+19.8%",color:"#34d399"}]}, p2:{text:"/transactions/ and /payments/make-payment/ are the most-viewed screens. The payments flow drives 18% of all views, signalling core product engagement.",highlights:[{word:"18%",color:"#34d399"}]} },
    "Avg Duration": { p1:{text:"Average session duration on web.monzo.com is 5m 12s — the second longest across all properties and up +12.2% vs prior.",highlights:[{word:"5m 12s",color:"#34d399"},{word:"+12.2%",color:"#34d399"}]}, p2:{text:"/payments/make-payment/ averages 7m 12s — the highest on any screen. Users are completing multi-step tasks, which is a strong signal of product engagement.",highlights:[{word:"7m 12s",color:"#34d399"}]} },
    "Bounce Rate": { p1:{text:"web.monzo.com has the lowest bounce rate across all properties at 16.4% — down from 18.8% prior period. Authenticated users arrive with clear intent.",highlights:[{word:"16.4%",color:"#34d399"}]}, p2:{text:"The /login/ page is the highest-bouncing screen at 28.4% — mostly authentication failures or users checking their balance on mobile.",highlights:[{word:"28.4%",color:"#f87171"}]} },
  },
  "community.monzo.com": {
    Sessions: { p1:{text:"community.monzo.com had 490K sessions — up +14.8%. The forum is growing steadily, driven by direct traffic and organic search across help and feature discussion threads.",highlights:[{word:"490K",color:"#34d399"},{word:"+14.8%",color:"#34d399"}]}, p2:{text:"The /c/feedback-and-ideas/ section averages 7m 02s per session — a strong signal that users are deeply engaged with product discussion and ideation.",highlights:[{word:"7m 02s",color:"#34d399"}]} },
    Users:     { p1:{text:"community.monzo.com reached 312K users this period — up +11.0%. The forum attracts a mix of new and returning members, with 57.6% returning.",highlights:[{word:"312K",color:"#34d399"},{word:"+11.0%",color:"#34d399"}]}, p2:{text:"Desktop accounts for 68.4% of community sessions — higher than other properties — suggesting users prefer longer form reading and posting on desktop.",highlights:[{word:"68.4%",color:"#34d399"}]} },
    Views:     { p1:{text:"community.monzo.com generated 894K views — up +16.4%. The /latest/ feed drives 8m 14s average duration, the highest single-page figure across all properties.",highlights:[{word:"894K",color:"#34d399"},{word:"+16.4%",color:"#34d399"}]}, p2:{text:"Views per session average 1.82x. The feedback and monzo-chat sections together account for 40% of all forum views.",highlights:[{word:"1.82x",color:"#34d399"},{word:"40%",color:"#34d399"}]} },
    "Avg Duration": { p1:{text:"Average session on community.monzo.com is 4m 28s — up +7.6%. The /latest/ feed and feedback sections show the deepest engagement.",highlights:[{word:"4m 28s",color:"#34d399"},{word:"+7.6%",color:"#34d399"}]}, p2:{text:"Users who land on /c/feedback-and-ideas/ average over 7 minutes — a strong signal of high intent. Consider featuring top threads on the homepage to extend discovery.",highlights:[{word:"7 minutes",color:"#34d399"}]} },
    "Bounce Rate": { p1:{text:"community.monzo.com bounce rate is 26.2% — down from 28.4% prior. The /latest/ section has the lowest bounce at 11.4%, pulling users into thread discussions.",highlights:[{word:"26.2%",color:"#34d399"},{word:"11.4%",color:"#34d399"}]}, p2:{text:"The homepage bounces at 26.4% — users who don't immediately click a thread tend to leave. A featured discussion widget could reduce this meaningfully.",highlights:[{word:"26.4%",color:"#f87171"}]} },
  },
  "api.monzo.com": {
    Sessions: { p1:{text:"api.monzo.com had 54.3K sessions — up +22.6%. Developer traffic is growing fast, led by direct access and GitHub referrals from the open-source community.",highlights:[{word:"54.3K",color:"#34d399"},{word:"+22.6%",color:"#34d399"}]}, p2:{text:"github.com and stackoverflow.com together drive 23% of all referral sessions. The /docs/ and /reference/ pages are the top entry points.",highlights:[{word:"23%",color:"#34d399"}]} },
    Users:     { p1:{text:"api.monzo.com reached 38.2K users — up +19.7%. Mac and Linux together account for 60% of OS share, reflecting the developer-skewed audience.",highlights:[{word:"38.2K",color:"#34d399"},{word:"+19.7%",color:"#34d399"}]}, p2:{text:"51.6% of users are returning — a healthy sign for a docs site. Developers are building integrations and returning to reference the API repeatedly.",highlights:[{word:"51.6%",color:"#34d399"}]} },
    Views:     { p1:{text:"api.monzo.com generated 113.7K views — up +24.1%. Views per session average 2.09x — the highest across all properties, as developers browse multiple reference pages.",highlights:[{word:"113.7K",color:"#34d399"},{word:"+24.1%",color:"#34d399"}]}, p2:{text:"/endpoints/transactions/ has the highest views-per-visit ratio. Adding code examples directly in the endpoint reference could increase depth further.",highlights:[{word:"transactions",color:"#34d399"}]} },
    "Avg Duration": { p1:{text:"Average session on api.monzo.com is 6m 14s — the longest across all properties and up +9.7%. Developers spend significant time reading endpoint specs and authentication flows.",highlights:[{word:"6m 14s",color:"#34d399"},{word:"+9.7%",color:"#34d399"}]}, p2:{text:"/endpoints/transactions/ averages 9m 12s — the longest page session on any single page across all four properties. Deep technical content is driving engagement.",highlights:[{word:"9m 12s",color:"#34d399"}]} },
    "Bounce Rate": { p1:{text:"api.monzo.com bounce rate is 24.8% — down from 27.4%. Developers who land on /docs/ or /reference/ almost always explore further, reflected in a 14.8% bounce on /docs/.",highlights:[{word:"24.8%",color:"#34d399"},{word:"14.8%",color:"#34d399"}]}, p2:{text:"The homepage bounces at 26.4% — developers who arrive without a specific endpoint in mind tend to leave. A prominent getting-started CTA could improve this.",highlights:[{word:"26.4%",color:"#f87171"}]} },
  },
};

const InsightCard = ({activeMetric="Sessions", activeProperty="All Properties"}) => {
  const propInsight = activeProperty!=="All Properties" ? PROPERTY_INSIGHTS[activeProperty]?.[activeMetric] : null;
  const insights = propInsight ? [propInsight] : (INSIGHTS[activeMetric] || INSIGHTS.Sessions);
  const [idx,setIdx]=useState(0);
  const [animKey,setAnimKey]=useState(0);
  const [visibleCount,setVisibleCount]=useState(0);
  const [copied,setCopied]=useState(false);
  const safeIdx = idx % insights.length;
  const insight=insights[safeIdx];
  const p1Words=insight.p1.text.split(" ");
  const p2Words=insight.p2.text.split(" ");
  const p1hl={}; insight.p1.highlights.forEach(h=>{p1hl[h.word]=h.color;});
  const p2hl={}; insight.p2.highlights.forEach(h=>{p2hl[h.word]=h.color;});

  useEffect(()=>{
    setVisibleCount(0); let i=0;
    const iv=setInterval(()=>{ i++; setVisibleCount(i); if(i>=p1Words.length+p2Words.length)clearInterval(iv); },70);
    return()=>clearInterval(iv);
  },[animKey, activeMetric]);

  useEffect(()=>{ setIdx(0); setAnimKey(k=>k+1); },[activeMetric, activeProperty]);

  const refresh=()=>{setIdx(i=>(i+1)%insights.length);setAnimKey(k=>k+1);};
  const copy=()=>{
    const txt=`${insight.p1.text}\n\n${insight.p2.text}`;
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}).catch(()=>{
        const el=document.createElement("textarea");el.value=txt;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);setCopied(true);setTimeout(()=>setCopied(false),2000);
      });
    } else {
      const el=document.createElement("textarea");el.value=txt;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);setCopied(true);setTimeout(()=>setCopied(false),2000);
    }
  };

  const renderWords=(words,hlMap,offset)=>words.map((word,i)=>{
    const color=hlMap[word];
    const visible=(offset+i)<visibleCount;
    return <span key={i} style={{display:"inline-block",opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(5px)",transition:"opacity 0.35s ease, transform 0.35s ease",color:color||"inherit",fontWeight:color?700:"inherit",marginRight:"0.3em"}}>{word}</span>;
  });

  return (
    <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:20,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:22,height:22,borderRadius:6,flexShrink:0,background:"linear-gradient(135deg,#10b981,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>M</div>
          <div><div style={{fontSize:14,fontWeight:600,color:"#e0e0e0"}}>AI Summary</div><div style={{fontSize:12,color:"#3a3a3a"}}>Powered by Claude.</div></div>
        </div>
        {/* Refresh button top-right */}
        <button onClick={()=>{refresh();}}
          onMouseEnter={e=>e.currentTarget.style.color="#888"}
          onMouseLeave={e=>e.currentTarget.style.color="#444"}
          title="Refresh"
          style={{background:"transparent",border:"none",cursor:"pointer",color:"#444",padding:2,display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}>
          <svg key={animKey} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{animation:animKey>0?"spin 0.5s ease-in-out":"none"}}>
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
        </button>
      </div>

      {/* Summary text */}
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:14}}>
        <p style={{margin:0,lineHeight:1.7,fontSize:15,color:"#777"}}>{renderWords(p1Words,p1hl,0)}</p>
        <p style={{margin:0,lineHeight:1.7,fontSize:15,color:"#777"}}>{renderWords(p2Words,p2hl,p1Words.length)}</p>
      </div>
      {/* Copy icon — bottom-right, mirrors refresh in top-right */}
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:14}}>
        <button onClick={copy}
          onMouseEnter={e=>e.currentTarget.style.color=copied?"#10b981":"#888"}
          onMouseLeave={e=>e.currentTarget.style.color=copied?"#10b981":"#444"}
          title="Copy summary"
          style={{background:"none",border:"none",cursor:"pointer",color:copied?"#10b981":"#444",padding:2,display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}>
          {copied
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          }
        </button>
      </div>
    </div>
  );
};

// ─── PICKERS ──────────────────────────────────────────────────────────────────
const PRESETS = ["Today","Last 7 Days","Last 14 Days","Last 28 Days","Last 30 Days","Last 3 Months","Last 6 Months","Last 12 Months","This Week","This Month","This Year","Custom Range"];
const COMPARISONS = ["Compare","Prev. Period","Prev. Month","Prev. Year","Custom Range"];

// ─── PROPERTY SWITCHER ────────────────────────────────────────────────────────
const PROPERTIES = ["All Properties","monzo.com","web.monzo.com","community.monzo.com","api.monzo.com"];
const PROP_COLORS = {"monzo.com":"#10b981","web.monzo.com":"#3b82f6","community.monzo.com":"#ec4899","api.monzo.com":"#f59e0b"};

const PropertySwitcher = ({property,setProperty}) => {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);
  const dot = PROP_COLORS[property];
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        onMouseEnter={e=>{if(!open)e.currentTarget.style.background="#27272a";}}
        onMouseLeave={e=>{if(!open)e.currentTarget.style.background=open?"#27272a":surface;}}
        style={{display:"flex",alignItems:"center",gap:6,fontSize:11,padding:"4px 10px",background:open?"#27272a":surface,border:`1px solid ${borderMid}`,borderRadius:7,color:text,cursor:"pointer",fontFamily:"inherit",fontWeight:500,transition:"all .15s"}}>
        {dot&&<span style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0}}/>}
        {property}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{opacity:0.4,transform:open?"rotate(180deg)":"none",transition:"transform .15s",flexShrink:0}}><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 5px)",left:0,background:"#1c1c1f",border:`1px solid ${borderMid}`,borderRadius:9,boxShadow:"0 8px 24px rgba(0,0,0,.6)",zIndex:300,overflow:"hidden",minWidth:200}}>
          {PROPERTIES.map(p=>(
            <button key={p} onClick={()=>{setProperty(p);setOpen(false);}}
              onMouseEnter={e=>{if(p!==property)e.currentTarget.style.background="#27272a";}}
              onMouseLeave={e=>{e.currentTarget.style.background=p===property?"#ffffff":"transparent";}}
              style={{width:"100%",textAlign:"left",fontSize:11,padding:"7px 12px",background:p===property?"#ffffff":"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:p===property?600:400,color:p===property?"#09090b":textDim,transition:"background .1s",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:8}}>
              {PROP_COLORS[p]&&<span style={{width:6,height:6,borderRadius:"50%",background:p===property?"#09090b":PROP_COLORS[p],flexShrink:0}}/>}
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const GRANULARITIES = ["Hourly","Daily","Weekly","Monthly"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const TODAY = new Date(2026,2,8);

const fmt2 = d => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
const sameDay = (a,b) => a&&b&&a.toDateString()===b.toDateString();

// Shared calendar used for both main range and comparison custom range
const CalendarPanel = ({start,end,hovered,onDayClick,onDayHover,month,year,onPrevMonth,onNextMonth,onSetYear,onBack,backLabel,hint}) => {
  const [showYears,setShowYears]=useState(false);
  const yearBase = year - (year % 12);
  const years = Array.from({length:12},(_,i)=>yearBase+i);

  return (
    <div style={{background:"#1c1c1f",border:`1px solid ${borderMid}`,borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,.7)",zIndex:300,padding:16,width:272}}
      onMouseLeave={()=>onDayHover(null)}>
      {/* Nav row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={()=>showYears?setShowYears(false):onPrevMonth()}
          style={{background:"transparent",border:`1px solid ${borderMid}`,borderRadius:6,color:textMid,cursor:"pointer",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        {/* Clickable month+year — year opens grid */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:12,fontWeight:600,color:text}}>{MONTHS[month]}</span>
          <button onClick={()=>setShowYears(v=>!v)}
            style={{fontSize:12,fontWeight:600,color:showYears?"#ffffff":textMid,background:showYears?"rgba(255,255,255,.1)":"transparent",border:"none",cursor:"pointer",borderRadius:4,padding:"1px 5px",fontFamily:"inherit",transition:"all .15s"}}>
            {year}
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginLeft:3,opacity:0.5,transform:showYears?"rotate(180deg)":"none",transition:"transform .15s"}}><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
        <button onClick={()=>showYears?setShowYears(false):onNextMonth()}
          style={{background:"transparent",border:`1px solid ${borderMid}`,borderRadius:6,color:textMid,cursor:"pointer",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Year grid overlay */}
      {showYears ? (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <button onClick={()=>onSetYear(yearBase-12)} style={{background:"transparent",border:"none",color:textMid,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>← Earlier</button>
            <button onClick={()=>onSetYear(yearBase+12)} style={{background:"transparent",border:"none",color:textMid,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Later →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
            {years.map(y=>(
              <button key={y} onClick={()=>{onSetYear(y);setShowYears(false);}}
                onMouseEnter={e=>{if(y!==year)e.currentTarget.style.background="#27272a";}}
                onMouseLeave={e=>{e.currentTarget.style.background=y===year?"#ffffff":"transparent";}}
                style={{padding:"6px 4px",fontSize:11,fontWeight:y===year?700:400,background:y===year?"#ffffff":"transparent",color:y===year?"#09090b":y>TODAY.getFullYear()?textFaint:textDim,border:`1px solid ${y===year?"#ffffff":borderMid}`,borderRadius:6,cursor:y>TODAY.getFullYear()?"default":"pointer",fontFamily:"inherit",transition:"all .1s"}}>
                {y}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Day grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:0,marginBottom:4}}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:textMuted,padding:"2px 0"}}>{d}</div>)}
          </div>
          <DayCells start={start} end={end} hovered={hovered} onDayClick={onDayClick} onDayHover={onDayHover} month={month} year={year}/>
        </>
      )}

      {/* Footer */}
      <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:10,color:textMuted,minHeight:14}}>{hint}</div>
        <button onClick={onBack}
          style={{width:28,height:28,background:"transparent",border:`1px solid ${borderMid}`,borderRadius:6,color:textMid,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
      </div>
    </div>
  );
};

const DayCells = ({start,end,hovered,onDayClick,onDayHover,month,year}) => {
  const first=new Date(year,month,1);
  const startDow=first.getDay();
  const days=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<startDow;i++) cells.push(null);
  for(let i=1;i<=days;i++) cells.push(new Date(year,month,i));
  const lo=start&&hovered&&!end?(start<hovered?start:hovered):(start&&end?(start<end?start:end):null);
  const hi=start&&hovered&&!end?(start<hovered?hovered:start):(start&&end?(start<end?end:start):null);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:0}}>
      {cells.map((d,i)=>{
        if(!d) return <div key={i} style={{height:30}}/>;
        const isFuture=d>TODAY;
        const isStart=sameDay(d,start),isEnd=sameDay(d,end);
        const inR=lo&&hi?(d>lo&&d<hi):false;
        let bg="transparent",col=isFuture?textFaint:textDim,fw=400,br=4;
        if(isStart||isEnd){bg="#ffffff";col="#09090b";fw=700;br=4;}
        else if(inR){bg="rgba(255,255,255,.12)";col=text;br=0;}
        return (
          <div key={i} onClick={()=>!isFuture&&onDayClick(d)} onMouseEnter={()=>!isFuture&&onDayHover(d)}
            style={{textAlign:"center",fontSize:11,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:isFuture?"default":"pointer",background:bg,color:col,fontWeight:fw,borderRadius:br,transition:"background .08s",userSelect:"none",WebkitUserSelect:"none"}}>
            {d.getDate()}
          </div>
        );
      })}
    </div>
  );
};

const DateRangePicker = ({comparison,onComparisonChange}) => {
  const [range,setRange]=useState("Today");
  const [open,setOpen]=useState(false);
  const [showCal,setShowCal]=useState(false);
  const [calStart,setCalStart]=useState(null);
  const [calEnd,setCalEnd]=useState(null);
  const [hovered,setHovered]=useState(null);
  const [calMonth,setCalMonth]=useState(TODAY.getMonth());
  const [calYear,setCalYear]=useState(TODAY.getFullYear());

  // Comparison custom range state
  const [compOpen,setCompOpen]=useState(false);
  const [showCompCal,setShowCompCal]=useState(false);
  const [compStart,setCompStart]=useState(null);
  const [compEnd,setCompEnd]=useState(null);
  const [compHovered,setCompHovered]=useState(null);
  const [compMonth,setCompMonth]=useState(TODAY.getMonth());
  const [compYear,setCompYear]=useState(TODAY.getFullYear());

  const ref=useRef(null), compRef=useRef(null);

  useEffect(()=>{
    const h=e=>{
      if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setShowCal(false);}
      if(compRef.current&&!compRef.current.contains(e.target)){setCompOpen(false);setShowCompCal(false);}
    };
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);

  const label = range==="Custom Range"&&calStart&&calEnd ? `${fmt2(calStart)} – ${fmt2(calEnd)}` : range;
  const compLabel = comparison==="Custom Range"&&compStart&&compEnd ? `${fmt2(compStart)} – ${fmt2(compEnd)}` : comparison;

  const handlePreset = p => {
    if(p==="Custom Range"){
      setCalStart(new Date(TODAY));setCalEnd(null);setHovered(null);
      setCalMonth(TODAY.getMonth());setCalYear(TODAY.getFullYear());
      setShowCal(true);return;
    }
    setRange(p);setOpen(false);setShowCal(false);
  };

  const handleDayClick = d => {
    if(!calStart||sameDay(d,calStart)){setCalStart(d);setCalEnd(null);return;}
    const s=calStart<d?calStart:d,e2=calStart<d?d:calStart;
    setCalEnd(e2);setCalStart(s);setRange("Custom Range");setOpen(false);setShowCal(false);
  };

  const handleCompDayClick = d => {
    if(!compStart||sameDay(d,compStart)){setCompStart(d);setCompEnd(null);return;}
    const s=compStart<d?compStart:d,e2=compStart<d?d:compStart;
    setCompEnd(e2);setCompStart(s);
    onComparisonChange("Custom Range");setCompOpen(false);setShowCompCal(false);
  };

  const prevMonth=()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);};
  const nextMonth=()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);};
  const prevCompMonth=()=>{if(compMonth===0){setCompMonth(11);setCompYear(y=>y-1);}else setCompMonth(m=>m-1);};
  const nextCompMonth=()=>{if(compMonth===11){setCompMonth(0);setCompYear(y=>y+1);}else setCompMonth(m=>m+1);};

  return (
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      {/* ── Main date range ── */}
      <div ref={ref} style={{position:"relative"}}>
        <button onClick={()=>{setOpen(o=>!o);setShowCal(false);}}
          onMouseEnter={e=>{if(!open)e.currentTarget.style.background="#27272a";}}
          onMouseLeave={e=>{if(!open)e.currentTarget.style.background=surface;}}
          style={{display:"flex",alignItems:"center",gap:5,fontSize:11,padding:"5px 10px",background:open?"#27272a":surface,border:`1px solid ${borderMid}`,borderRadius:7,color:text,cursor:"pointer",fontFamily:"inherit",fontWeight:500,transition:"all .15s",whiteSpace:"nowrap"}}>
          {label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{opacity:0.4,transform:open?"rotate(180deg)":"none",transition:"transform .15s",flexShrink:0}}><path d="M6 9l6 6 6-6"/></svg>
        </button>

        {open&&!showCal&&(
          <div style={{position:"absolute",top:"calc(100% + 5px)",left:0,background:"#1c1c1f",border:`1px solid ${borderMid}`,borderRadius:9,boxShadow:"0 8px 24px rgba(0,0,0,.6)",zIndex:300,overflow:"hidden"}}>
            {PRESETS.map(p=>(
              <button key={p} onClick={()=>handlePreset(p)}
                onMouseEnter={e=>{if(p!==range)e.currentTarget.style.background="#27272a";}}
                onMouseLeave={e=>{e.currentTarget.style.background=p===range?"#ffffff":"transparent";}}
                style={{width:"100%",textAlign:"left",fontSize:11,padding:"7px 12px",background:p===range?"#ffffff":"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:p===range?600:400,color:p===range?"#09090b":textDim,transition:"background .1s",whiteSpace:"nowrap",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
                {p}
                {p==="Custom Range"&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>}
              </button>
            ))}
          </div>
        )}

        {showCal&&(
          <div style={{position:"absolute",top:"calc(100% + 5px)",left:0,zIndex:300}}>
            <CalendarPanel
              start={calStart} end={calEnd} hovered={hovered}
              onDayClick={handleDayClick} onDayHover={setHovered}
              month={calMonth} year={calYear}
              onPrevMonth={prevMonth} onNextMonth={nextMonth}
              onSetYear={y=>{setCalYear(y);}}
              onBack={()=>{setShowCal(false);setOpen(true);}}
              hint={!calEnd?"Move cursor to select, click to confirm":""}
            />
          </div>
        )}
      </div>

      {/* ── vs. ── */}
      <span style={{fontSize:10,color:textMuted,fontWeight:500,padding:"0 2px"}}>vs.</span>

      {/* ── Comparison ── */}
      <div ref={compRef} style={{position:"relative"}}>
        <button onClick={()=>{setCompOpen(o=>!o);setShowCompCal(false);}}
          onMouseEnter={e=>{if(!compOpen)e.currentTarget.style.background="#27272a";}}
          onMouseLeave={e=>{if(!compOpen)e.currentTarget.style.background=surface;}}
          style={{display:"flex",alignItems:"center",gap:5,fontSize:11,padding:"5px 10px",background:compOpen?"#27272a":surface,border:`1px solid ${borderMid}`,borderRadius:7,color:text,cursor:"pointer",fontFamily:"inherit",fontWeight:500,transition:"all .15s",whiteSpace:"nowrap"}}>
          {compLabel}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{opacity:0.4,transform:compOpen?"rotate(180deg)":"none",transition:"transform .15s",flexShrink:0}}><path d="M6 9l6 6 6-6"/></svg>
        </button>

        {compOpen&&!showCompCal&&(
          <div style={{position:"absolute",top:"calc(100% + 5px)",right:0,background:"#1c1c1f",border:`1px solid ${borderMid}`,borderRadius:9,boxShadow:"0 8px 24px rgba(0,0,0,.6)",zIndex:300,overflow:"hidden"}}>
            {COMPARISONS.map((c,i)=>(
              <div key={c}>
                {i===COMPARISONS.length-1&&<div style={{height:1,background:borderMid,margin:"4px 0"}}/>}
                <button onClick={()=>{
                    if(c==="Custom Range"){
                      setCompStart(new Date(TODAY));setCompEnd(null);setCompHovered(null);
                      setCompMonth(TODAY.getMonth());setCompYear(TODAY.getFullYear());
                      setShowCompCal(true);return;
                    }
                    onComparisonChange(c);setCompOpen(false);
                  }}
                  onMouseEnter={e=>{if(c!==comparison)e.currentTarget.style.background="#27272a";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=c===comparison?"#ffffff":"transparent";}}
                  style={{width:"100%",textAlign:"left",fontSize:11,padding:"7px 12px",background:c===comparison?"#ffffff":"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:c===comparison?600:400,color:c===comparison?"#09090b":textDim,transition:"background .1s",whiteSpace:"nowrap",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
                  {c}
                  {c==="Custom Range"&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>}
                </button>
              </div>
            ))}
          </div>
        )}

        {showCompCal&&(
          <div style={{position:"absolute",top:"calc(100% + 5px)",right:0,zIndex:300}}>
            <CalendarPanel
              start={compStart} end={compEnd} hovered={compHovered}
              onDayClick={handleCompDayClick} onDayHover={setCompHovered}
              month={compMonth} year={compYear}
              onPrevMonth={prevCompMonth} onNextMonth={nextCompMonth}
              onSetYear={y=>setCompYear(y)}
              onBack={()=>{setShowCompCal(false);setCompOpen(true);}}
              hint={!compEnd?"Select comparison end date":""}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const GranularityPicker = ({value, onChange}) => {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);}; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",alignItems:"center",gap:5,fontSize:11,padding:"4px 10px",background:open?"#27272a":surface,border:`1px solid ${borderMid}`,borderRadius:7,color:text,cursor:"pointer",fontFamily:"inherit",fontWeight:500,transition:"all .15s"}}>
        {value}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{opacity:0.5,transform:open?"rotate(180deg)":"none",transition:"transform .15s"}}><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 5px)",right:0,background:"#1c1c1f",border:`1px solid ${borderMid}`,borderRadius:9,boxShadow:"0 8px 24px rgba(0,0,0,.5)",zIndex:100,overflow:"hidden"}}>
          {GRANULARITIES.map(g=>(
            <button key={g} onClick={()=>{onChange(g);setOpen(false);}}
              onMouseEnter={e=>{if(g!==value)e.currentTarget.style.background="#27272a";}}
              onMouseLeave={e=>{e.currentTarget.style.background=g===value?"#ffffff":"transparent";}}
              style={{width:"100%",textAlign:"left",fontSize:11,padding:"7px 10px",background:g===value?"#ffffff":"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:g===value?600:400,color:g===value?"#09090b":textDim,transition:"background .1s",whiteSpace:"nowrap"}}>
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const ChartTooltip = ({active,payload,label,tab}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:card,border:`1px solid ${borderMid}`,borderRadius:8,padding:"8px 12px",boxShadow:"0 8px 24px rgba(0,0,0,.5)"}}>
      <div style={{fontSize:11,color:textMuted,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:p.color}}/>
          <span style={{fontSize:11,color:textDim,textTransform:"capitalize"}}>{p.dataKey}</span>
          <span style={{fontSize:11,fontWeight:600,color:text,marginLeft:4}}>{fm(p.value,tab)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const FilterDropdown = ({value, onChange, options, placeholder}) => {
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const label = value===options[0].value ? placeholder : options.find(o=>o.value===value)?.label||value;
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,padding:"4px 10px",background:open?"#27272a":surface,border:`1px solid ${borderMid}`,borderRadius:7,color:text,cursor:"pointer",fontFamily:"inherit",fontWeight:500,whiteSpace:"nowrap",transition:"background .15s"}}>
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{opacity:0.5,transform:open?"rotate(180deg)":"none",transition:"transform .15s"}}><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 5px)",left:0,background:"#1c1c1f",border:`1px solid ${borderMid}`,borderRadius:9,boxShadow:"0 8px 24px rgba(0,0,0,.5)",zIndex:200,overflow:"hidden",minWidth:150}}>
          {options.map(o=>(
            <button key={o.value} onClick={()=>{onChange(o.value);setOpen(false);}}
              onMouseEnter={e=>{if(o.value!==value)e.currentTarget.style.background="#27272a";}}
              onMouseLeave={e=>{e.currentTarget.style.background=o.value===value?"#ffffff":"transparent";}}
              style={{width:"100%",textAlign:"left",fontSize:11,padding:"8px 12px",background:o.value===value?"#ffffff":"transparent",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:o.value===value?600:400,color:o.value===value?"#09090b":textDim,transition:"background .1s"}}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function MetrikDashboard() {
  const [active,setActive]=useState("Sessions");
  const [property,setProperty]=useState("All Properties");
  const [granularity,setGranularity]=useState("Daily");

  const kpiCards = [
    { label:"Sessions",     val:"8,214,300", chg:"+22.1%", pos:true,  cur:8214300, prev:6727000 },
    { label:"Users",        val:"5,891,420", chg:"+19.4%", pos:true,  cur:5891420, prev:4934000 },
    { label:"Views",        val:"14,628,900", chg:"+26.3%", pos:true, cur:14628900, prev:11582000 },
    { label:"Avg Duration", val:"3m 42s",    chg:"+6.8%",  pos:true,  cur:222,     prev:208     },
    { label:"Bounce Rate",  val:"32.3%",     chg:"-3.8%",  pos:true,  cur:52.4,    prev:54.5    },
  ];

  const pd = PROPERTY_DATA[property];

  // Derived datasets — fall back to module-level defaults when "All Properties"
  const curChannelData    = pd ? pd.channels  : channelData;
  const curDeviceData     = pd ? pd.devices   : deviceData;
  const curNewReturn      = pd ? pd.newReturn : newReturningData;
  const curEventData      = pd ? pd.events    : eventData;
  const curOsData         = pd ? pd.os.map(o=>({...o,sessions:Math.round(o.value/100*(pd.kpi.sessionsN))})) : osData;
  const curBrowserData    = pd ? pd.browsers.map(b=>({...b,sessions:Math.round(b.value/100*(pd.kpi.sessionsN))})) : browserData;
  const curReferrerData   = pd ? pd.referrers.map(r=>({name:r.name,visitors:r.visitors})) : referrerData;
  const curUtmData        = pd ? pd.utm.map(u=>({name:u.name,visitors:u.visitors})) : utmData;
  const curCountryData    = pd ? pd.countries : allCountryData;
  const curTrafficSources = pd ? pd.sources   : allTrafficSources;
  const curPages          = pd ? pd.pages     : topPages;
  const curYoyData        = pd ? pd.yoy       : yoyData;

  // KPI values
  const curKpi = pd ? [
    { label:"Sessions",     val:pd.kpi.sessions,    chg:pd.kpi.sessChg,    pos:true,  cur:pd.kpi.sessionsN, prev:pd.kpi.sessionsPrev },
    { label:"Users",        val:pd.kpi.users,       chg:pd.kpi.usrChg,     pos:true,  cur:pd.kpi.usersN,    prev:pd.kpi.usersPrev },
    { label:"Views",        val:pd.kpi.views,       chg:pd.kpi.vwChg,      pos:true,  cur:pd.kpi.viewsN,    prev:pd.kpi.viewsPrev },
    { label:"Avg Duration", val:pd.kpi.dur,         chg:pd.kpi.durChg,     pos:pd.kpi.durPos, cur:pd.kpi.durN, prev:pd.kpi.durPrev },
    { label:"Bounce Rate",  val:pd.kpi.bounce,      chg:pd.kpi.bounceChg,  pos:pd.kpi.bouncePos, cur:pd.kpi.bounceN, prev:pd.kpi.bouncePrev },
  ] : kpiCards;
  const [search,setSearch]=useState("");
  const [pageFilter,setPageFilter]=useState("All");
  const [propFilter,setPropFilter]=useState("All");
  const [regexMode,setRegexMode]=useState(false);
  const [regexError,setRegexError]=useState(false);
  const [comparison,setComparison]=useState("Compare");
  const [countryModalOpen,setCountryModalOpen]=useState(false);
  const [trafficModalOpen,setTrafficModalOpen]=useState(false);
  const [referrerModalOpen,setReferrerModalOpen]=useState(false);
  const showChg = comparison !== "Compare";

  const propKeyMap = {"monzo.com":"monzo","web.monzo.com":"web","community.monzo.com":"community","api.monzo.com":"api"};
  const propData = property==="All Properties"
    ? (propertyDataMap[active]||propertyDataMap.Sessions)
    : [{ name:propKeyMap[property]||property, value:100, sessions:(pd?.kpi?.[active==="Sessions"?"sessionsN":active==="Users"?"usersN":active==="Views"?"viewsN":active==="Avg Duration"?"durN":"bounceN"]||0), color:"#e4e4e7" }];
  const PAGE_TYPE_PATTERNS = {
    "All": null,
    "Features": /^\/features\//,
    "Docs": /^\/(docs|reference|authentication|endpoints|getting-started)/,
    "Forum": /^\/(c\/|latest|top)/,
    "Account": /^\/(account|transactions|payments|pots|savings|flex|settings|login)/,
    "Marketing": /^\/(personal-account|business|get-started|about|pricing|careers|download|switch)/,
  };
  const filtered = curPages.filter(row => {
    const propOk = propFilter==="All" || row.property===propFilter;
    let pageOk = true;
    if(pageFilter!=="All") {
      const pat = PAGE_TYPE_PATTERNS[pageFilter];
      pageOk = pat ? pat.test(row.page) : true;
    }
    let searchOk = true;
    if(search) {
      if(regexMode) {
        try { searchOk = new RegExp(search,"i").test(row.page)||new RegExp(search,"i").test(row.property); }
        catch(e) { searchOk = false; }
      } else {
        searchOk = row.page.toLowerCase().includes(search.toLowerCase())||row.property.toLowerCase().includes(search.toLowerCase());
      }
    }
    return propOk && pageOk && searchOk;
  });

  return (
    <div style={{display:"flex",height:"100vh",background:bg,color:text,fontFamily:"-apple-system,BlinkMacSystemFont,'Inter',sans-serif",overflow:"hidden"}}>
      <style>{`.modal-scroll{scrollbar-width:thin;scrollbar-color:#2a2a2a transparent;}.modal-scroll::-webkit-scrollbar{width:5px;}.modal-scroll::-webkit-scrollbar-track{background:transparent;}.modal-scroll::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:3px;}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}input::placeholder{color:#52525b;}`}</style>
      <ReferrersModal open={referrerModalOpen} onClose={()=>setReferrerModalOpen(false)} activeTab={active} referrerData={curReferrerData} utmData={curUtmData} showChg={showChg}/>

      {/* Sidebar */}
      <div style={{width:200,flexShrink:0,borderRight:`1px solid ${border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <img src="data:image/png;base64,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" alt="Monzo" style={{width:28,height:28,borderRadius:8,objectFit:"cover",flexShrink:0}}/>
            <span style={{fontSize:13,fontWeight:700,color:text}}>Monzo</span>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 8px",scrollbarWidth:"none"}}>
          {Object.entries(navItems).map(([section,items])=>(
            <div key={section} style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,color:textFaint,letterSpacing:"0.8px",padding:"0 6px",marginBottom:4,textTransform:"uppercase"}}>{section}</div>
              {items.map(item=>(
                <button key={item}
                  onMouseEnter={e=>{if(item==="Website Analytics")e.currentTarget.style.background="#ffffff";}}
                  onMouseLeave={e=>{if(item==="Website Analytics")e.currentTarget.style.background="#ffffff";}}
                  style={{width:"100%",textAlign:"left",fontSize:12,padding:"5px 8px",borderRadius:6,border:"none",cursor:item==="Website Analytics"?"default":"not-allowed",fontFamily:"inherit",fontWeight:item==="Website Analytics"?600:400,transition:"all 0.1s",
                    background:item==="Website Analytics"?"#ffffff":"transparent",
                    color:item==="Website Analytics"?"#09090b":"#2a2a2e",
                    opacity:item==="Website Analytics"?1:0.35,
                    filter:item==="Website Analytics"?"none":"blur(1.5px)",
                    pointerEvents:item==="Website Analytics"?"auto":"none"}}>
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Topbar */}
        <div style={{position:"sticky",top:0,zIndex:20,background:"rgba(9,9,11,.92)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${border}`,padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <span style={{fontSize:13,fontWeight:600,color:text}}>Website Analytics</span>
            <PropertySwitcher property={property} setProperty={setProperty}/>

          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <DateRangePicker comparison={comparison} onComparisonChange={setComparison}/>
            <GranularityPicker value={granularity} onChange={setGranularity}/>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:12,scrollbarWidth:"thin",scrollbarColor:`${borderBright} transparent`}}>

          {/* Prototype Banner */}
            <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:10,padding:"14px 18px"}}>
              <div style={{fontSize:13,fontWeight:700,color:text,marginBottom:3}}>Miles's Web Analytics Dashboard</div>
              <div style={{fontSize:11,color:textMuted,lineHeight:1.5}}>Built to demonstrate what a unified web analytics platform could look like across Monzo's property portfolio.</div>
            </div>

          {/* KPI Cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
            {curKpi.map(k=>(
              <div key={k.label} onClick={()=>setActive(k.label)}
                style={{background:active===k.label?"#111113":"#0f0f0f",border:`2px solid ${active===k.label?borderMid:"transparent"}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",transition:"all .15s",boxSizing:"border-box"}}>
                <div style={{fontSize:11,color:textMuted,marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                  {k.label}<InfoTip id={k.label}/>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:text,lineHeight:1,marginBottom:6}}>{k.val}</div>
                <div style={{fontSize:10,color:k.pos?"#34d399":"#f87171",fontWeight:600,minHeight:14}}>
                  {showChg ? k.chg : ""}
                </div>
              </div>
            ))}
          </div>

          {/* Area Chart */}
          <Card>
            <CardHead title={`${active} over time`} sub={`${granularity} · ${property==="All Properties"?"All properties":property}`}/>
            <Body style={{height:220,paddingBottom:8}}>
              {(()=>{
                const isRate = active==="Bounce Rate"||active==="Avg Duration";
                const granData = (GRANULARITY_DATA[granularity]||METRIC_DAILY)[active] || dailySessionData;
                // Map property names to chart data keys
                const propKeyMap = {"monzo.com":"monzo","web.monzo.com":"web","community.monzo.com":"community","api.monzo.com":"api"};
                const allKeys = ["monzo","web","community","api"];
                const allColors = {monzo:"#10b981",web:"#3b82f6",community:"#ec4899",api:"#f59e0b"};
                const activeKeys = property==="All Properties" ? allKeys : [propKeyMap[property]].filter(Boolean);
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={granData} margin={{top:4,right:4,bottom:0,left:-10}}>
                      <defs>
                        {activeKeys.map(k=>(
                          <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={allColors[k]} stopOpacity={0.12}/>
                            <stop offset="95%" stopColor={allColors[k]} stopOpacity={0.01}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <XAxis dataKey="date" tick={{fontSize:10,fill:textMuted}} tickLine={false} axisLine={false} interval={Math.floor(granData.length/6)}/>
                      <YAxis tick={{fontSize:10,fill:textMuted}} tickLine={false} axisLine={false} tickFormatter={v=>isRate?active==="Bounce Rate"?`${v}%`:fm(v,active):fn(v)}/>
                      <Tooltip content={<ChartTooltip tab={active}/>}/>
                      {activeKeys.map(k=>(
                        <Area key={k} type="monotone" dataKey={k} stroke={allColors[k]} strokeWidth={1.5} fill={`url(#g-${k})`}/>
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                );
              })()}
            </Body>
          </Card>

          {/* AI + Channels + Referrers */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <InsightCard activeMetric={active} activeProperty={property}/>
            <TrafficChannelsCard data={curChannelData} activeTab={active} showChg={showChg}/>
            <ReferrersCard activeTab={active} onExpand={()=>setReferrerModalOpen(true)} referrerData={curReferrerData} utmData={curUtmData} showChg={showChg}/>
          </div>

          {/* Donuts */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            <DonutCard title={property==="All Properties"?`${active} by Property`:property} sub={property==="All Properties"?"Split across Monzo properties":`Single property view`} data={propData} showChg={showChg}/>
            <DonutCard title="Device Breakdown" sub="Sessions by device type" data={curDeviceData} showChg={showChg}/>
            <DonutCard title="New vs Returning" sub="User type breakdown" data={curNewReturn} showChg={showChg}/>
          </div>

          {/* Geo */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {/* Top Countries */}
            <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:20}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{fontSize:14,fontWeight:600,color:"#e0e0e0"}}>Countries</div><InfoTip id="Countries"/></div>
                <button onClick={()=>setCountryModalOpen(true)} onMouseEnter={e=>e.currentTarget.style.color="#888"} onMouseLeave={e=>e.currentTarget.style.color="#333"} style={{background:"transparent",border:"none",borderRadius:6,color:"#444",padding:"2px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
              </div>
              {(()=>{
                const totalAll=curCountryData.reduce((s,r)=>s+(gmv(r,active)||0),0);
                return [...curCountryData].sort((a,b)=>(gmv(b,active)||0)-(gmv(a,active)||0)).slice(0,5).map((row,i)=>{
                  const cur=gmv(row,active)||0; const prev=gmv(row,active,"prev")||0;
                  const pct=prev>0?((cur-prev)/prev)*100:0; const changeColor=pct===0?"#555":pct>0?"#10b981":"#ef4444";
                  const barW=totalAll>0?Math.round((cur/totalAll)*100):0;
                  const valStr=fm(cur,active); const pctStr=totalAll>0?`${Math.round(cur/totalAll*100)}%`:"--";
                  return (
                    <div key={i} onMouseEnter={e=>{e.currentTarget.querySelector(".row-label").style.color="#ccc";const v=e.currentTarget.querySelector(".row-val");v.style.color="#fff";v.textContent=pctStr;}} onMouseLeave={e=>{e.currentTarget.querySelector(".row-label").style.color="#888";const v=e.currentTarget.querySelector(".row-val");v.style.color="#999";v.textContent=valStr;}} style={{padding:"8px 0",borderBottom:i<5?"1px solid #141414":"none",cursor:"default"}}>
                      <div style={{display:"flex",alignItems:"center",marginBottom:5}}>
                        <span className="row-label" style={{flex:1,fontSize:12,color:"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"color 0.15s"}}>{row.country}</span>
                        <span className="row-val" style={{fontSize:13,fontWeight:700,color:"#999",minWidth:52,textAlign:"right",transition:"color 0.15s"}}>{valStr}</span>
                        {showChg&&<span style={{fontSize:11,fontWeight:600,color:changeColor,minWidth:56,textAlign:"right"}}>{pct>0?"+":pct<0?"-":""}{Math.abs(pct).toFixed(1)}%</span>}
                      </div>
                      <div style={{height:3,borderRadius:2,background:"#1a1a1a",overflow:"hidden"}}><div style={{height:"100%",width:`${barW}%`,background:"#e4e4e7",borderRadius:2}}/></div>
                    </div>
                  );
                });
              })()}
            </div>
            <ExpandModal open={countryModalOpen} onClose={()=>setCountryModalOpen(false)} title="Countries" accentColor="#e4e4e7" nameKey="country" allData={curCountryData} headers={["Country",active]} exportRows={[...curCountryData].sort((a,b)=>(gmv(b,active)||0)-(gmv(a,active)||0)).map(r=>[r.country,gmv(r,active)])} activeTab={active} showChg={showChg}/>

            {/* Top Traffic Sources */}
            <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:20}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{fontSize:14,fontWeight:600,color:"#e0e0e0"}}>Traffic Sources</div><InfoTip id="Traffic Sources"/></div>
                <button onClick={()=>setTrafficModalOpen(true)} onMouseEnter={e=>e.currentTarget.style.color="#888"} onMouseLeave={e=>e.currentTarget.style.color="#333"} style={{background:"transparent",border:"none",borderRadius:6,color:"#444",padding:"2px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"color 0.15s"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
              </div>
              {(()=>{
                const totalAll=curTrafficSources.reduce((s,r)=>s+(gmv(r,active)||0),0);
                return [...curTrafficSources].sort((a,b)=>(gmv(b,active)||0)-(gmv(a,active)||0)).slice(0,5).map((row,i)=>{
                  const cur=gmv(row,active)||0; const prev=gmv(row,active,"prev")||0;
                  const pct=prev>0?((cur-prev)/prev)*100:0; const changeColor=pct===0?"#555":pct>0?"#10b981":"#ef4444";
                  const barW=totalAll>0?Math.round((cur/totalAll)*100):0;
                  const valStr=fm(cur,active); const pctStr=totalAll>0?`${Math.round(cur/totalAll*100)}%`:"--";
                  return (
                    <div key={i} onMouseEnter={e=>{e.currentTarget.querySelector(".row-label").style.color="#ccc";const v=e.currentTarget.querySelector(".row-val");v.style.color="#fff";v.textContent=pctStr;}} onMouseLeave={e=>{e.currentTarget.querySelector(".row-label").style.color="#888";const v=e.currentTarget.querySelector(".row-val");v.style.color="#999";v.textContent=valStr;}} style={{padding:"8px 0",borderBottom:i<5?"1px solid #141414":"none",cursor:"default"}}>
                      <div style={{display:"flex",alignItems:"center",marginBottom:5}}>
                        <span className="row-label" style={{flex:1,fontSize:12,color:"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"color 0.15s"}}>{row.source||row.name}</span>
                        <span className="row-val" style={{fontSize:13,fontWeight:700,color:"#999",minWidth:52,textAlign:"right",transition:"color 0.15s"}}>{valStr}</span>
                        {showChg&&<span style={{fontSize:11,fontWeight:600,color:changeColor,minWidth:56,textAlign:"right"}}>{pct>0?"+":pct<0?"-":""}{Math.abs(pct).toFixed(1)}%</span>}
                      </div>
                      <div style={{height:3,borderRadius:2,background:"#1a1a1a",overflow:"hidden"}}><div style={{height:"100%",width:`${barW}%`,background:"#e4e4e7",borderRadius:2}}/></div>
                    </div>
                  );
                });
              })()}
            </div>
            <ExpandModal open={trafficModalOpen} onClose={()=>setTrafficModalOpen(false)} title="Traffic Sources" accentColor="#e4e4e7" nameKey="source" allData={curTrafficSources} headers={["Source",active]} exportRows={[...curTrafficSources].sort((a,b)=>(gmv(b,active)||0)-(gmv(a,active)||0)).map(r=>[r.source||r.name,gmv(r,active)])} activeTab={active} showChg={showChg}/>
          </div>

          {/* Events + OS */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            <EventsCard eventData={curEventData} showChg={showChg}/>
            <OsBrowserCard activeTab={active} osData={curOsData} browserData={curBrowserData} showChg={showChg}/>
          </div>

          {/* Top Pages */}
          <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:20}}>
            <SectionHeader title="Pages" subtitle="" tip="Pages">
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                {/* Property filter dropdown */}
                <FilterDropdown
                  value={propFilter}
                  onChange={setPropFilter}
                  placeholder="All Properties"
                  options={[
                    {value:"All",label:"All Properties"},
                    {value:"monzo",label:"monzo"},
                    {value:"web",label:"web"},
                    {value:"community",label:"community"},
                    {value:"api",label:"api"},
                  ]}
                />
                {/* Page type filter dropdown */}
                <FilterDropdown
                  value={pageFilter}
                  onChange={setPageFilter}
                  placeholder="All Page Types"
                  options={Object.keys(PAGE_TYPE_PATTERNS).map(t=>({value:t,label:t==="All"?"All Page Types":t}))}
                />
                {/* Search / Regex input */}
                <div style={{display:"flex",alignItems:"center",gap:0,background:surface,border:`1px solid ${regexError?"#ef4444":borderMid}`,borderRadius:7,overflow:"hidden",minWidth:200}}>
                  <input value={search} onChange={e=>{setSearch(e.target.value);if(regexMode){try{new RegExp(e.target.value);setRegexError(false);}catch(ex){setRegexError(true);}}}}
                    placeholder={regexMode?"Regex pattern…":"⌕ Search pages…"}
                    style={{background:"transparent",border:"none",outline:"none",fontSize:11,color:regexError?"#ef4444":text,fontFamily:"inherit",padding:"4px 10px",flex:1,minWidth:0}}/>
                  <button onClick={()=>{setRegexMode(r=>!r);setSearch("");setRegexError(false);}}
                    title="Toggle regex mode"
                    style={{padding:"4px 8px",background:regexMode?"#27272a":"transparent",border:"none",borderLeft:`1px solid ${borderMid}`,cursor:"pointer",color:regexMode?"#e4e4e7":textDim,fontSize:11,fontFamily:"monospace",fontWeight:600,transition:"all .12s",whiteSpace:"nowrap"}}>
                    .*
                  </button>
                </div>
                {/* Result count */}
                <span style={{fontSize:11,color:"#444",whiteSpace:"nowrap"}}>{filtered.length} pages</span>
              </div>
            </SectionHeader>
            <div className="modal-scroll" style={{overflowY:"auto",maxHeight:420}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead style={{position:"sticky",top:0,background:"#0f0f0f",zIndex:1}}>
                  <tr style={{borderBottom:"1px solid #1a1a1a"}}>
                    {[["Property",null],["Page",null],["Sessions","Sessions"],["Users","Users"],["Views","Views"],["Avg Duration","Avg Duration"],["Bounce Rate","Bounce Rate"]].map(([h,key])=>{
                      const isActive=key===active;
                      const w=h==="Property"?"90px":h==="Page"?"auto":"100px";
                      return <th key={h} style={{textAlign:h==="Property"||h==="Page"?"left":"right",padding:"8px 10px",fontSize:11,color:isActive?"#ffffff":"#333",fontWeight:isActive?700:600,letterSpacing:"0.3px",width:w,whiteSpace:"nowrap"}}>{h}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row,i)=>(<tr key={i} onMouseEnter={e=>e.currentTarget.style.background="#141414"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{borderBottom:"1px solid #141414",transition:"background 0.15s",cursor:"default"}}>
                    <td style={{padding:"10px 10px"}}><PropertyBadge name={row.property}/></td>
                    <td style={{padding:"10px 10px",fontSize:12,color:"#888"}}>{row.page}</td>
                    <td style={{padding:"10px 10px",fontSize:12,color:active==="Sessions"?"#ffffff":textDim,fontWeight:active==="Sessions"?600:400,textAlign:"right",width:"100px"}}>{fn(row.sessions)}</td>
                    <td style={{padding:"10px 10px",fontSize:12,color:active==="Users"?"#ffffff":textDim,fontWeight:active==="Users"?600:400,textAlign:"right",width:"100px"}}>{fn(row.users)}</td>
                    <td style={{padding:"10px 10px",fontSize:12,color:active==="Views"?"#ffffff":textDim,fontWeight:active==="Views"?600:400,textAlign:"right",width:"100px"}}>{fn(row.views||0)}</td>
                    <td style={{padding:"10px 10px",fontSize:12,color:active==="Avg Duration"?"#ffffff":textDim,fontWeight:active==="Avg Duration"?600:400,textAlign:"right",width:"100px"}}>{row.duration}</td>
                    <td style={{padding:"10px 10px",fontSize:12,color:active==="Bounce Rate"?"#ffffff":textDim,fontWeight:active==="Bounce Rate"?600:400,textAlign:"right",width:"100px"}}>{row.bounce}</td>
                  </tr>))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
