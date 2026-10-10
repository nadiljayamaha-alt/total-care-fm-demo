(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('js-ready');

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: 0.12});
  $$('.reveal').forEach(element => observer.observe(element));

  const menuButton = $('.menu-button');
  const menu = $('#mobile-menu');
  const setMenu = open => {
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    $('main').inert = open; $('footer').inert = open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuButton.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) {setMenu(false);menuButton.focus();}
    if (event.key === 'Tab' && !menu.hidden) {
      const focusable=[menuButton,...$$('a, button',menu)];
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  window.addEventListener('resize', () => {if (window.innerWidth > 760) setMenu(false);});

  const enquiry = $('#enquiry-dialog');
  const serviceDialog = $('#service-dialog');
  const credits = $('#credits-dialog');
  let lastDialogTrigger;
  const openDialog = (dialog, trigger) => {
    if (trigger.closest('#mobile-menu')) lastDialogTrigger = menuButton;
    else if (!trigger.closest('dialog')) lastDialogTrigger = trigger;
    setMenu(false);
    $$('dialog[open]').forEach(open => open.close());
    if(dialog === enquiry){$('#enquiry-form').hidden=false;$('#enquiry-result').hidden=true;}
    dialog.showModal();
  };
  $$('[data-enquire]').forEach(button => button.addEventListener('click', () => openDialog(enquiry, button)));
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {if (!document.querySelector('dialog[open]')) lastDialogTrigger?.focus();});
  });
  $('#credits-button').addEventListener('click', event => openDialog(credits,event.currentTarget));

  const services = {
    cleaning: {title:'Commercial cleaning',description:'A programme starts with understanding the site and the people who use it',questions:['Which areas need routine cleaning and which need occasional work?','What access and trading hours shape the schedule?','How should the scope, inspections and communication work?']},
    floors: {title:'Specialist floor care',description:'Different surfaces need different treatments, so assessment comes before a maintenance plan',questions:['What is the floor material and its current condition?','Is the work a deep clean, a surface treatment or an ongoing programme?','What downtime and access can the site allow?']},
    access: {title:'High-level cleaning',description:'Plan for the surfaces above everyday reach and the access needed to work on them',questions:['Which overhead surfaces need attention?','What equipment, access and site controls will the work require?','When can the area be safely made available?']},
    facilities: {title:'Facility & site services',description:'Start by defining the responsibilities the site needs supported',questions:['Which services need coordination and who currently owns them?','Is the scope for a single property or multiple sites?','What reporting and escalation process would be useful?']}
  };
  const servicePhotos = {
    cleaning: {photo:'assets/stock-office.jpg',alt:'Stock photograph of a modern open-plan commercial office',position:'50% 50%'},
    floors: {photo:'assets/stock-floorcare.jpg',alt:'Stock photograph of an operator using a ride-on floor scrubber',position:'50% 60%'},
    access: {photo:'assets/atrium.jpg',alt:'Stock photograph looking up at the high glass roof of a commercial atrium',position:'50% 50%'},
    facilities: {photo:'assets/stock-warehouse.jpg',alt:'Stock photograph of tall storage racks along a warehouse aisle',position:'50% 55%'}
  };
  const updatePhoto = (photo, data) => {
    photo.alt = data.alt;
    photo.style.objectPosition = data.position;
    if(photo.getAttribute('src') === data.photo) return;
    photo.onload = () => {
      if (!reducedMotion.matches) photo.animate([{opacity:.35},{opacity:1}],{duration:450,easing:'ease-out'});
    };
    photo.src = data.photo;
  };
  const serviceItems = $$('.service-item');
  serviceItems.forEach(item => item.addEventListener('toggle', () => {
    if (!item.open) return;
    serviceItems.filter(other => other !== item).forEach(other => other.open = false);
    $('.service-visual').dataset.active = item.dataset.service;
    updatePhoto($('#service-photo'),servicePhotos[item.dataset.service]);
    $('#service-visual-label').textContent = `${$('summary .mono', item).textContent} / ${$('h3', item).textContent}`;
  }));
  $$('[data-detail]').forEach(button => button.addEventListener('click', () => {
    const service = services[button.dataset.detail];
    $('#service-dialog-title').textContent = service.title;
    $('.service-dialog-description').textContent = service.description;
    const list = $('ul', serviceDialog);list.replaceChildren();
    service.questions.forEach(question => { const li=document.createElement('li');li.textContent=question;list.append(li); });
    $('#service').value = service.title;
    openDialog(serviceDialog,button);
  }));

  const form = $('#enquiry-form');
  const result = $('#enquiry-result');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(form);
    const list = $('dl',result); list.replaceChildren();
    [['Service',values.get('service')],['Space',values.get('facility')],['Your brief',values.get('notes') || 'To discuss together']].forEach(([label,value]) => {
      const term = document.createElement('dt'); term.textContent = label;
      const definition = document.createElement('dd'); definition.textContent = value;
      list.append(term,definition);
    });
    form.hidden = true; result.hidden = false; $('#edit-brief').focus();
  });
  $('#edit-brief').addEventListener('click',() => {result.hidden=true;form.hidden=false;$('#service').focus();});

  const environments = {
    retail: {index:'01',label:'Retail spaces',title:'Ready for the\nday ahead',description:'Entrances, floors and shared spaces all shape a visit\nPlan the work around access, foot traffic and trading hours',photo:'assets/stock-retail.jpg',alt:'Stock photograph of a multilevel shopping centre atrium',position:'50% 45%'},
    workplaces: {index:'02',label:'Workplaces',title:'Space to do\nyour best work',description:'Shared spaces need a practical routine\nConsider working hours, access and the way each area is used',photo:'assets/stock-office.jpg',alt:'Stock photograph of a modern open-plan commercial office',position:'50% 50%'},
    industrial: {index:'03',label:'Large facilities',title:'Attention on\na different scale',description:'Large spaces bring their own demands\nStart with the surfaces, movement and access requirements of the site',photo:'assets/stock-warehouse.jpg',alt:'Stock photograph of tall storage racks along a warehouse aisle',position:'50% 55%'}
  };
  const tabs = $$('[data-environment]');
  const setLines = (element, text) => {element.replaceChildren();text.split('\n').forEach((line,i) => {if(i)element.append(document.createElement('br'));element.append(document.createTextNode(line));});};
  const activateTab = button => {
    const data = environments[button.dataset.environment];
    tabs.forEach(tab => {const selected=tab===button;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
    $('#environment-panel').setAttribute('aria-labelledby',button.id);
    $('#environment-kicker').textContent = `${data.index} / ${data.label}`;
    setLines($('#environment-title'),data.title);setLines($('#environment-description'),data.description);
    updatePhoto($('#environment-photo'),data);
  };
  tabs.forEach((button,i) => {
    button.addEventListener('click',()=>activateTab(button));
    button.addEventListener('keydown',event => {
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();activateTab(tabs[next]);tabs[next].focus();}
    });
  });

  const wordHeading = $('.word-reveal');
  const walker = document.createTreeWalker(wordHeading,NodeFilter.SHOW_TEXT);
  const textNodes=[];while(walker.nextNode())textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    const fragment=document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(part => {
      if(/\S/.test(part)){const span=document.createElement('span');span.className='word';span.textContent=part;fragment.append(span);}else fragment.append(document.createTextNode(part));
    });node.replaceWith(fragment);
  });
  const words = $$('.word',wordHeading);
  const careBand = $('.care-band');
  const steps=[{word:'a closer look',title:'Understand the place',copy:'The people, the surfaces, the trading hours and the details that make your site different'},{word:'a clear plan',title:'Define the work',copy:'A considered scope brings the service, schedule and responsibilities into focus'},{word:'in the detail',title:'Keep the conversation open',copy:'A practical way to review the work, raise an issue and agree what needs attention'}];
  let manualStep = null;
  const showStep = step => {
    $('.care-word').textContent=steps[step].word;$('#care-step-title').textContent=steps[step].title;$('#care-step-copy').textContent=steps[step].copy;$('.care-counter').textContent=`0${step+1} / 03`;
    $$('[data-step]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.step)===step)));
  };
  $$('[data-step]').forEach(button=>button.addEventListener('click',()=>{manualStep=Number(button.dataset.step);showStep(manualStep);}));
  let ticking = false;
  const clamp = value => Math.min(1,Math.max(0,value));
  const updateScroll = () => {
    ticking=false;
    const height=window.innerHeight;
    const pageProgress=clamp(window.scrollY/Math.max(1,document.documentElement.scrollHeight-height));
    $('.scroll-progress').style.width=`${pageProgress*100}%`;
    const introRect=wordHeading.getBoundingClientRect();
    const wordProgress=reducedMotion.matches?1:clamp((height*.88-introRect.top)/(height*.58));
    words.forEach((word,i)=>word.classList.toggle('lit',i<Math.ceil(wordProgress*words.length)));
    const careRect=careBand.getBoundingClientRect();
    const careProgress=reducedMotion.matches?0:clamp(-careRect.top/Math.max(1,careRect.height-height));
    const step=manualStep ?? Math.min(2,Math.floor(careProgress*3));
    if($('.care-word').textContent!==steps[step].word) showStep(step);
    $('.care-rule span').style.width=`${reducedMotion.matches?100:careProgress*100}%`;
    if(!reducedMotion.matches){
      const heroRect=$('.hero-image').getBoundingClientRect();
      if(heroRect.bottom>0&&heroRect.top<height) $('.hero-image img').style.transform=`scale(1.08) translateY(${Math.max(-30,Math.min(30,(height*.4-heroRect.top)*.055))}px)`;
      if(careRect.bottom>0&&careRect.top<height) $('.care-outline').style.transform=`rotate(${-12+careProgress*24}deg) scale(${1+careProgress*.15})`;
    }
  };
  window.addEventListener('scroll',() => {manualStep=null;if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}},{passive:true});
  window.addEventListener('resize',updateScroll);reducedMotion.addEventListener('change',updateScroll);updateScroll();
})();
