import { RequesterPdfService } from 'src/core/services/requester/requester-pdf.service';
(async () => {
  const s = new RequesterPdfService();
  const r: any = { id:'x', reference:'DI-0001', ticket:'AY-0001', priority:'Normal', status:'Open', description:'Test probleme long', correction:'corriger', title:null,
    createdAt:new Date(), requesttype:{name:'Type'}, station:{name:'St'}, branch:{name:'Dekel'}, labAgent:null, operator:null, createdBy:{username:'u'} };
  for (const lang of ['fr','en',undefined]) { const b = await s.render(r, { lang, printedBy:'boris' } as any); console.log(lang, 'OK', b.length); }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
