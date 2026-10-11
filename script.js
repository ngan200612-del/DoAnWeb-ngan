const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(Number(n)||0);
const today = () => new Date().toLocaleDateString('vi-VN');

const ADMIN_EMAIL = 'ngan200612@gmail.com';
const ADMIN_PASSWORD = '123123';
let authMode = 'login';
let currentAccount = null;
const readUsers = () => { try { return JSON.parse(localStorage.getItem('novamart_users')) || []; } catch { return []; } };
const writeUsers = users => localStorage.setItem('novamart_users', JSON.stringify(users));
function authMessage(message='', success=false){const el=$('#authMessage');el.textContent=message;el.style.color=success?'#20865f':'#d05252';}
function setAuthMode(mode){
 authMode=mode;authMessage('');
 const titles={login:['Đăng nhập','Đăng nhập để tiếp tục vào hệ thống quản lý.','Đăng nhập'],register:['Tạo tài khoản','Đăng ký tài khoản để sử dụng NovaMart.','Tạo tài khoản'],admin:['Đăng nhập Admin','Khu vực dành riêng cho quản trị viên.','Đăng nhập Admin'],forgot:['Khôi phục mật khẩu','Nhập email đã đăng ký và đặt mật khẩu mới.','Đặt lại mật khẩu']};
 $('#authTitle').textContent=titles[mode][0];$('#authSubtitle').textContent=titles[mode][1];$('#authSubmit').innerHTML=titles[mode][2]+' <span>↗</span>';
 $('#authNameWrap').hidden=mode!=='register';$('#authConfirmWrap').hidden=mode!=='register';$('#authPasswordWrap').hidden=mode==='forgot';$('#authNewPasswordWrap').hidden=mode!=='forgot';
 $('#authName').required=mode==='register';$('#authConfirm').required=mode==='register';$('#authPassword').required=mode!=='forgot';$('#authNewPassword').required=mode==='forgot';
 $('#authPassword').autocomplete=mode==='register'||mode==='forgot'?'new-password':'current-password';
 $$('#authTabs .auth-tab').forEach(b=>b.classList.toggle('active',b.dataset.authMode===mode));$('#authTabs').style.display=mode==='forgot'?'none':'grid';
 $('#authBottom').innerHTML=mode==='forgot'?'<button type="button" class="auth-link" id="backToLogin">← Quay lại đăng nhập</button><span>Khôi phục trên bản demo</span>':mode==='register'?'<span>Đã có tài khoản? <button type="button" class="auth-link" id="backLogin">Đăng nhập</button></span>':'<button type="button" class="auth-link" id="forgotPassword">Quên mật khẩu?</button><span>Chưa có tài khoản? <button type="button" class="auth-link" id="goRegister">Đăng ký</button></span>';
 $('#authSecurityNote').textContent=mode==='forgot'?'Lưu ý: bản demo không gửi email. Mật khẩu mới được lưu ngay trên trình duyệt này.':'Bản demo học tập · Tài khoản được lưu trong trình duyệt, chưa có máy chủ bảo mật.';
}
function enterApp(account){
 currentAccount=account;localStorage.setItem('novamart_session',JSON.stringify(account));
 $('#authScreen').style.display='none';$('#appShell').style.display='';
 const displayName=account.name||(account.role==='admin'?'Quản trị viên':'Người dùng');
 $('#profileName').textContent=displayName;$('#profileRole').textContent=account.role==='admin'?'Admin · NovaMart':'Tài khoản · NovaMart';
 $('#profileAvatar').textContent=(displayName.trim()[0]||'N').toUpperCase();$('#topAvatar').textContent=(displayName.trim()[0]||'N').toUpperCase();
 const welcome=$('.welcome-row h1');if(welcome)welcome.innerHTML='Chào bạn, '+esc(displayName)+' <span class="wave">✦</span>';
}
function leaveApp(){localStorage.removeItem('novamart_session');currentAccount=null;$('#appShell').style.display='none';$('#authScreen').style.display='grid';$('#authEmail').value='';$('#authPassword').value='';setAuthMode('login');}
function handleAuthSubmit(e){
 e.preventDefault();authMessage('');const email=$('#authEmail').value.trim().toLowerCase();const password=$('#authPassword').value;const users=readUsers();
 if(authMode==='register'){
  const name=$('#authName').value.trim();const confirm=$('#authConfirm').value;
  if(!name){authMessage('Vui lòng nhập họ tên.');return;}if(password.length<6){authMessage('Mật khẩu phải có ít nhất 6 ký tự.');return;}if(password!==confirm){authMessage('Mật khẩu nhập lại chưa khớp.');return;}if(email===ADMIN_EMAIL){authMessage('Email này dành riêng cho đăng nhập Admin.');return;}if(users.some(u=>u.email===email)){authMessage('Email đã được đăng ký. Hãy đăng nhập.');return;}
  users.push({id:Date.now(),name,email,password,role:'user'});writeUsers(users);authMessage('Đăng ký thành công! Đang đăng nhập...',true);enterApp(users[users.length-1]);return;
 }
 if(authMode==='admin'){
  if(email===ADMIN_EMAIL&&password===ADMIN_PASSWORD){enterApp({name:'Quản trị viên',email,role:'admin'});return;}authMessage('Email hoặc mật khẩu Admin không chính xác.');return;
 }
 if(authMode==='forgot'){
  const newPassword=$('#authNewPassword').value;if(newPassword.length<6){authMessage('Mật khẩu mới cần ít nhất 6 ký tự.');return;}if(email===ADMIN_EMAIL){authMessage('Không thể đặt lại tài khoản Admin từ biểu mẫu demo.');return;}const index=users.findIndex(u=>u.email===email);if(index<0){authMessage('Không tìm thấy email này trong danh sách đăng ký.');return;}users[index].password=newPassword;writeUsers(users);authMessage('Đã đổi mật khẩu trên trình duyệt. Bạn có thể đăng nhập.',true);setTimeout(()=>setAuthMode('login'),900);return;
 }
 if(email===ADMIN_EMAIL){authMessage('Hãy chọn tab Admin để đăng nhập quản trị.');return;}const user=users.find(u=>u.email===email&&u.password===password);if(!user){authMessage('Email hoặc mật khẩu không đúng. Nếu chưa có tài khoản, hãy đăng ký.');return;}enterApp(user);
}
$('#authForm').addEventListener('submit',handleAuthSubmit);
$('#authTabs').addEventListener('click',e=>{const b=e.target.closest('[data-auth-mode]');if(b)setAuthMode(b.dataset.authMode);});
document.addEventListener('click',e=>{if(e.target.closest('#forgotPassword'))setAuthMode('forgot');if(e.target.closest('#goRegister'))setAuthMode('register');if(e.target.closest('#backLogin')||e.target.closest('#backToLogin'))setAuthMode('login');});
$('#logoutBtn').addEventListener('click',leaveApp);
try{const savedSession=JSON.parse(localStorage.getItem('novamart_session'));if(savedSession&&(savedSession.role==='admin'||readUsers().some(u=>u.email===savedSession.email))){enterApp(savedSession);}else{localStorage.removeItem('novamart_session');}}catch{}
const imageFor = {
  'Đồ uống':'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=80',
  'Thực phẩm':'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80',
  'Gia dụng':'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80',
  'Chăm sóc cá nhân':'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=80',
  'Bánh kẹo':'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=700&q=80'
};
const productImages = [
 'https://product.hstatic.net/200000460455/product/cam_8c8581dab18f4c3c8d47d59618c1afd0_748c7d2bec174e65ae70cf590cf61dec_master.png',
 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=700&q=80',
 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=700&q=80',
 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=700&q=80',
 'https://cdn.tgdd.vn/2021/08/CookProduct/1-1200x676-42.jpg',
 'https://alltop.vn/backend/media/images/posts/695/Sua_rua_mat_CeraVe-277078.jpg'
];
const initial = {
 products:[
  {id:1,code:'HH001',name:'Nước cam nguyên chất',category:'Đồ uống',buy:12000,price:18000,qty:28,unit:'Chai',image:productImages[0],min:10},
  {id:2,code:'HH002',name:'Sữa tươi tiệt trùng',category:'Đồ uống',buy:7500,price:11000,qty:7,unit:'Hộp',image:productImages[1],min:10},
  {id:3,code:'HH003',name:'Táo đỏ nhập khẩu',category:'Thực phẩm',buy:32000,price:45000,qty:35,unit:'Kg',image:productImages[2],min:10},
  {id:4,code:'HH004',name:'Mật ong thiên nhiên',category:'Thực phẩm',buy:65000,price:89000,qty:12,unit:'Lọ',image:productImages[3],min:10},
  {id:5,code:'HH005',name:'Bánh mì nguyên cái',category:'Bánh kẹo',buy:14000,price:22000,qty:5,unit:'Gói',image:productImages[4],min:10},
  {id:6,code:'HH006',name:'Sữa rửa mặt dịu nhẹ Cereva ',category:'Chăm sóc cá nhân',buy:42000,price:59000,qty:18,unit:'Tuýp',image:productImages[5],min:10},
  {id:7,code:'HH007',name:'Sữa rửa mặt',category:'Gia dụng',buy:26000,price:36000,qty:22,unit:'Chai',image:imageFor['Gia dụng'],min:10},
  {id:8,code:'HH008',name:'Bánh quy bơ',category:'Bánh kẹo',buy:18000,price:27000,qty:9,unit:'Hộp',image:imageFor['Bánh kẹo'],min:10}
 ],
 people:[
  {id:101,type:'employees',name:'Phạm Quang Ngân',role:'Quản lý cửa hàng',phone:'0356 552 064',email:'phamquangngan@example.com',address:'Nam Định',salary:9500000},
  {id:102,type:'employees',name:'Vương Đắc Tuấn Anh',role:'Nhân viên bán hàng',phone:'0975 234 567',email:'tuananh@example.com',address:'Nam Định',salary:7200000},
  {id:103,type:'employees',name:'Tuất Khang',role:'Nhân viên kho',phone:'0968 345 678',email:'tuankhang@example.com',address:'Nam Định',salary:7500000},
  {id:201,type:'suppliers',name:'Công ty Thực phẩm Xanh',role:'Thực phẩm',phone:'024 3822 1000',email:'xanh@example.com',address:'Hà Nội'},
  {id:202,type:'suppliers',name:'Nhà phân phối An Phát',role:'Đồ uống & tiêu dùng',phone:'0228 355 6677',email:'anphat@example.com',address:'Nam Định'},
  {id:301,type:'customers',name:'Phạm Hoàng Nam',role:'Khách hàng thân thiết',phone:'0988 112 233',email:'hoangnam@example.com',address:'Nam Định'},
  {id:302,type:'customers',name:'Lê Ngọc',role:'Khách hàng',phone:'0912 333 444',email:'lengoc0107@example.com',address:'Nam Định'}
 ],
 sales:[],
 roadmap:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]
};
let db;
try { db = JSON.parse(localStorage.getItem('novamart_db')) || structuredClone(initial); } catch { db = structuredClone(initial); }
if(!db.products || !db.people || !db.sales || !db.roadmap) db=structuredClone(initial);
let currentPage='dashboard', personTab='employees', editing=null, formType=null, pendingPersonType='employees';
function save(){localStorage.setItem('novamart_db',JSON.stringify(db));}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function productImage(p){return p.image || imageFor[p.category] || productImages[0];}
function toast(message, ok=true){const el=document.createElement('div');el.className='toast';el.innerHTML=`<span>${ok?'✓':'!'}</span><div>${esc(message)}</div>`;$('#toastWrap').append(el);setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),300)},3200);}
function go(page){currentPage=page;$$('.page').forEach(p=>p.classList.toggle('active-page',p.id===`page-${page}`));$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));$('#crumb').textContent=({dashboard:'Tổng quan',products:'Hàng hóa',inventory:'Kho & tồn kho',sales:'Bán hàng / hóa đơn',people:'Nhân sự & đối tác',reports:'Báo cáo',roadmap:'Lộ trình 15 tuần'})[page]||'Tổng quan';$('#sidebar').classList.remove('open');renderAll();window.scrollTo({top:0,behavior:'smooth'});}
function getLow(){return db.products.filter(p=>Number(p.qty)<Number(p.min||10));}
function totals(){return {stock:db.products.reduce((s,p)=>s+Number(p.buy)*Number(p.qty),0),revenue:db.sales.reduce((s,x)=>s+x.total,0),units:db.products.reduce((s,p)=>s+Number(p.qty),0),low:getLow().length};}
function renderAll(){renderDashboard();renderProducts();renderInventory();renderSales();renderPeople();renderReports();renderRoadmap();$('#navProductCount').textContent=db.products.length;$('#todayLabel').textContent=today();}
function renderDashboard(){
 const t=totals();$('#statProducts').textContent=db.products.length;$('#statStockValue').textContent=money(t.stock);$('#statOrders').textContent=db.sales.length;$('#statPeople').textContent=db.people.filter(p=>p.type==='employees').length;$('#chartRevenue').textContent=money(t.revenue);$('#chartOrders').textContent=`${db.sales.length} hóa đơn`;
 const low=getLow().slice(0,5);$('#lowStockList').innerHTML=low.length?low.map(p=>`<div class="low-stock-item"><div class="mini-product">${categoryEmoji(p.category)}</div><div class="low-stock-info"><b>${esc(p.name)}</b><small>${esc(p.code)} · ${esc(p.category)}</small></div><span class="stock-number">${p.qty} ${esc(p.unit)}</span></div>`).join(''):`<div class="empty-inline">✓ Tồn kho đang ổn định.</div>`;
 const items=[...db.products].slice(0,4);$('#featuredProducts').innerHTML=items.length?items.map(p=>`<div class="featured-item" data-edit-product="${p.id}"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.src='${productImages[0]}'"><div class="featured-info"><b>${esc(p.name)}</b><span>${money(p.price)}</span></div></div>`).join(''):'<div class="empty-inline">Chưa có hàng hóa.</div>';
 const recent=db.sales.slice(-7);const vals=recent.map(x=>x.total);const max=Math.max(...vals,1);const chart=$('#barChart');chart.innerHTML='';if(!vals.length){chart.innerHTML='<div class="empty-inline" style="width:100%">Tạo hóa đơn để xem biểu đồ doanh thu.</div>';}else vals.forEach((v,i)=>{const d=document.createElement('div');d.className='bar-col';d.innerHTML=`<div class="bar" title="${money(v)}" style="height:${Math.max(7,v/max*100)}%"></div><span>${i+1}</span>`;chart.append(d);});
}
function categoryEmoji(c){return ({'Đồ uống':'🥤','Thực phẩm':'🍎','Gia dụng':'🧴','Chăm sóc cá nhân':'🫧','Bánh kẹo':'🍪'})[c]||'📦';}
function renderProducts(){const q=($('#productSearch')?.value||'').toLowerCase(),cat=$('#categoryFilter')?.value||'',sf=$('#stockFilter')?.value||'';const list=db.products.filter(p=>(`${p.name} ${p.code}`.toLowerCase().includes(q))&&(!cat||p.category===cat)&&(!sf||(sf==='low'?p.qty<p.min:p.qty>=p.min)));$('#productGrid').innerHTML=list.map((p,i)=>`<article class="product-card" style="animation-delay:${Math.min(i,8)*.035}s"><div class="product-image"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" loading="lazy" onerror="this.src='${productImages[0]}'"><span class="category-tag">${esc(p.category)}</span><span class="stock-tag ${p.qty<p.min?'low':''}">${p.qty<p.min?'Sắp hết':'Còn hàng'}</span></div><div class="product-info"><span class="product-code">${esc(p.code)}</span><h3 title="${esc(p.name)}">${esc(p.name)}</h3><div class="product-meta"><span class="product-price">${money(p.price)}</span><span class="product-quantity">${p.qty} ${esc(p.unit)}</span></div><div class="product-actions"><button class="small-action" data-edit-product="${p.id}">✎ Sửa</button><button class="small-action" data-stock-product="${p.id}">＋ Nhập kho</button><button class="small-action danger" data-delete-product="${p.id}">×</button></div></div></article>`).join('');$('#productEmpty').classList.toggle('hidden',list.length>0);}
function renderInventory(){const t=totals();$('#invUnits').textContent=t.units.toLocaleString('vi-VN');$('#invLow').textContent=t.low;$('#invCategories').textContent=new Set(db.products.map(p=>p.category)).size;const q=($('#inventorySearch')?.value||'').toLowerCase();const list=db.products.filter(p=>(p.name+' '+p.code).toLowerCase().includes(q));$('#inventoryTable').innerHTML=list.map(p=>`<tr><td><div class="table-product"><img src="${esc(productImage(p))}" alt="" onerror="this.src='${productImages[0]}'"><div><b>${esc(p.name)}</b><small>${esc(p.unit)}</small></div></div></td><td>${esc(p.code)}</td><td>${esc(p.category)}</td><td>${money(p.buy)}</td><td><b>${p.qty}</b> ${esc(p.unit)}</td><td><span class="status-pill ${p.qty<p.min?'warning':''}">${p.qty<p.min?'Sắp hết hàng':'Đủ hàng'}</span></td><td><div class="row-actions"><button class="row-action" data-stock-product="${p.id}">＋ Nhập</button><button class="row-action" data-adjust-product="${p.id}">± Sửa tồn</button></div></td></tr>`).join('');}
function renderSales(){const t=totals();$('#salesCount').textContent=db.sales.length;$('#salesRevenue').textContent=money(t.revenue);const q=($('#salesSearch')?.value||'').toLowerCase();const list=[...db.sales].reverse().filter(s=>(s.code+' '+s.customer).toLowerCase().includes(q));$('#salesTable').innerHTML=list.map(s=>`<tr><td><b>${esc(s.code)}</b></td><td>${esc(s.customer)}</td><td>${esc(s.date)}</td><td>${s.items.reduce((a,x)=>a+x.qty,0)}</td><td><b>${money(s.total)}</b></td><td><span class="status-pill">Hoàn thành</span></td><td><div class="row-actions"><button class="row-action" data-view-sale="${s.id}">Chi tiết</button><button class="row-action" data-delete-sale="${s.id}">Xóa</button></div></td></tr>`).join('');$('#salesEmpty').classList.toggle('hidden',list.length>0);}
function renderPeople(){const all=db.people.filter(p=>p.type===personTab);$('#employeeCount').textContent=db.people.filter(p=>p.type==='employees').length;$('#supplierCount').textContent=db.people.filter(p=>p.type==='suppliers').length;$('#customerCount').textContent=db.people.filter(p=>p.type==='customers').length;const q=($('#peopleSearch')?.value||'').toLowerCase();const list=all.filter(p=>(p.name+' '+p.phone+' '+p.email).toLowerCase().includes(q));$('#peopleGrid').innerHTML=list.map((p,i)=>`<article class="person-card" style="animation-delay:${i*.04}s"><div class="person-card-top"><div class="person-avatar">${esc(p.name.split(' ').map(x=>x[0]).slice(-2).join('').toUpperCase())}</div><div><h3>${esc(p.name)}</h3><small>${esc(p.role||'Chưa phân loại')}</small></div></div><span class="person-role">${({employees:'Nhân viên',suppliers:'Nhà cung cấp',customers:'Khách hàng'})[p.type]}</span><div class="person-detail"><span>Điện thoại</span><b>${esc(p.phone||'—')}</b></div><div class="person-detail"><span>Email</span><b>${esc(p.email||'—')}</b></div><div class="person-detail"><span>Địa chỉ</span><b>${esc(p.address||'—')}</b></div><div class="person-actions"><button class="small-action" data-edit-person="${p.id}">✎ Chỉnh sửa</button><button class="small-action danger" data-delete-person="${p.id}">Xóa</button></div></article>`).join('');$('#peopleEmpty').classList.toggle('hidden',list.length>0);$$('.people-tab').forEach(b=>b.classList.toggle('active',b.dataset.personTab===personTab));}
function renderReports(){const t=totals();$('#reportRevenue').textContent=money(t.revenue);$('#reportStock').textContent=money(t.stock);$('#reportProducts').textContent=db.products.length;$('#reportLow').textContent=t.low;const cats={};db.products.forEach(p=>cats[p.category]=(cats[p.category]||0)+1);const max=Math.max(1,...Object.values(cats));$('#categoryReport').innerHTML=Object.entries(cats).map(([c,n])=>`<div><div class="category-line-head"><b>${categoryEmoji(c)} ${esc(c)}</b><span>${n} mặt hàng</span></div><div class="progress-track"><div class="progress-fill" style="width:${n/max*100}%"></div></div></div>`).join('')||'<p class="muted">Chưa có dữ liệu.</p>';$('#topStockReport').innerHTML=[...db.products].sort((a,b)=>b.qty-a.qty).slice(0,5).map(p=>`<div class="top-stock-item"><img src="${esc(productImage(p))}" alt="" onerror="this.src='${productImages[0]}'"><div><b>${esc(p.name)}</b><small>${esc(p.category)}</small></div><strong>${p.qty}</strong></div>`).join('')||'<p class="muted">Chưa có dữ liệu.</p>';}
const weeks=[
['Khởi tạo & phân tích','Khảo sát và xác định phạm vi','Bản đăng ký đề tài + Outline kế hoạch 15 tuần'],
['Khởi tạo & phân tích','Phân tích yêu cầu nghiệp vụ','Bản phân tích yêu cầu nghiệp vụ hệ thống'],
['Khởi tạo & phân tích','Đặc tả yêu cầu và mô hình nghiệp vụ','Tài liệu SRS + sơ đồ Use Case, DFD, Activity Diagram'],
['Thiết kế hệ thống & giao diện','Thiết kế dữ liệu và khung dự án','Sơ đồ ERD + script SQL + Base Project'],
['Thiết kế hệ thống & giao diện','Thiết kế giao diện và API','Bản thiết kế UI/UX + tài liệu API (Postman)'],
['Phát triển phần mềm','Đăng nhập và phân quyền','Module đăng nhập & phân quyền hoàn chỉnh'],
['Phát triển phần mềm','Quản lý danh mục','Module sản phẩm, nguyên vật liệu, máy móc'],
['Phát triển phần mềm','Dashboard và tiếp nhận đơn hàng','Dashboard sản xuất + tiếp nhận đơn hàng'],
['Phát triển phần mềm','Xuất nguyên vật liệu và tồn kho','Chức năng xuất nguyên vật liệu + cập nhật tồn kho'],
['Phát triển phần mềm','Hoàn thành lệnh sản xuất','Hoàn thành lệnh sản xuất + nhập kho thành phẩm'],
['Phát triển phần mềm','Báo cáo thống kê','Module báo cáo sản lượng, chi phí & hiệu quả'],
['Kiểm thử, đóng gói & báo cáo','Kiểm thử và sửa lỗi','Bảng Test Case + sản phẩm đã kiểm thử'],
['Kiểm thử, đóng gói & báo cáo','Triển khai sản phẩm','Đường dẫn Website/App Deploy + GitHub Repo'],
['Kiểm thử, đóng gói & báo cáo','Hoàn thiện tài liệu','Báo cáo đồ án + slide thuyết trình + video demo'],
['Kiểm thử, đóng gói & báo cáo','Bảo vệ đồ án','Hoàn thành buổi bảo vệ đồ án chính thức']
];
function renderRoadmap(){const done=db.roadmap.filter(Boolean).length;$('#progressPercent').textContent=Math.round(done/15*100)+'%';$('#progressRing').style.background=`conic-gradient(#baf1db ${done/15*100}%,#ffffff16 0)`;$('#timeline').innerHTML=weeks.map((w,i)=>`<article class="week-card ${db.roadmap[i]?'done':''}"><div class="week-top"><span class="week-num">TUẦN ${i+1}</span><span class="week-phase">${esc(w[0])}</span></div><h3>${esc(w[1])}</h3><p>${i===0?'Khảo sát quy trình, xác định mô hình và phạm vi triển khai.':i===1?'Thu thập và phân tích yêu cầu chức năng, phi chức năng.':i===2?'Mô tả luồng nghiệp vụ và các tác nhân của hệ thống.':i===3?'Thiết kế dữ liệu, bảng chính và cấu trúc mã nguồn.':i===4?'Hoàn thiện bản thiết kế màn hình và mô tả API.':i===5?'Xây dựng xác thực tài khoản và phân quyền.':i===6?'Phát triển các chức năng quản lý danh mục dữ liệu.':i===7?'Xây dựng màn hình tổng quan và quy trình tiếp nhận đơn.':i===8?'Theo dõi xuất nguyên vật liệu và số lượng tồn kho.':i===9?'Cập nhật sản lượng, thành phẩm và nhập kho.':i===10?'Tổng hợp số liệu để hỗ trợ đánh giá hiệu quả.':i===11?'Kiểm thử luồng nghiệp vụ, xử lý lỗi và trường hợp biên.':i===12?'Triển khai bản demo và quản lý mã nguồn.':i===13?'Chuẩn bị báo cáo, slide và video minh họa.':'Rà soát sản phẩm và chuẩn bị buổi bảo vệ.'}</p><div class="week-result"><b>Kết quả:</b> ${esc(w[2])}</div><button class="week-toggle" data-toggle-week="${i}">${db.roadmap[i]?'✓ Đã hoàn thành · Bỏ đánh dấu':'○ Đánh dấu hoàn thành'}</button></article>`).join('');}
function openModal(title,fields,type,editData=null){editing=editData;formType=type;$('#modalTitle').textContent=title;$('#modalFields').innerHTML=fields.map(f=>{const value=editData?.[f.name]??f.value??'';let control='';if(f.type==='select')control=`<select name="${f.name}" ${f.required?'required':''}>${f.options.map(o=>`<option value="${esc(o)}" ${String(value)===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;else if(f.type==='textarea')control=`<textarea name="${f.name}" placeholder="${esc(f.placeholder||'')}" ${f.required?'required':''}>${esc(value)}</textarea>`;else control=`<input name="${f.name}" type="${f.type||'text'}" value="${esc(value)}" placeholder="${esc(f.placeholder||'')}" ${f.required?'required':''} ${f.min!==undefined?`min="${f.min}"`:''} ${f.step?`step="${f.step}"`:''}>`;return `<div class="field ${f.full?'full':''}"><label>${esc(f.label)}${f.required?' *':''}</label>${control}${f.hint?`<small class="field-hint">${esc(f.hint)}</small>`:''}</div>`}).join('');$('#modalBackdrop').classList.remove('hidden');document.body.style.overflow='hidden';setTimeout(()=>$('#modalFields input')?.focus(),60);}
function closeModal(){$('#modalBackdrop').classList.add('hidden');document.body.style.overflow='';editing=null;formType=null;}
function productFields(p={}){return [{name:'name',label:'Tên hàng hóa',required:true,placeholder:'Ví dụ: Nước cam nguyên chất',full:true},{name:'code',label:'Mã hàng',required:true,placeholder:'HH009'},{name:'category',label:'Danh mục',type:'select',required:true,options:['Đồ uống','Thực phẩm','Gia dụng','Chăm sóc cá nhân','Bánh kẹo']},{name:'buy',label:'Giá nhập (VNĐ)',type:'number',required:true,min:0,step:500,value:0},{name:'price',label:'Giá bán (VNĐ)',type:'number',required:true,min:0,step:500,value:0},{name:'qty',label:'Số lượng tồn',type:'number',required:true,min:0,step:1,value:0},{name:'unit',label:'Đơn vị tính',required:true,value:'Cái'},{name:'min',label:'Ngưỡng cảnh báo tồn',type:'number',required:true,min:0,step:1,value:10},{name:'image',label:'Đường dẫn ảnh (URL)',placeholder:'Để trống dùng ảnh theo danh mục',full:true}].map(f=>({...f,value:p[f.name]??f.value}));}
function startAddProduct(){openModal('Thêm hàng hóa mới',productFields({code:'HH'+String(Math.max(0,...db.products.map(p=>Number(p.id)))+1).padStart(3,'0')}),'product');}
function startEditProduct(id){const p=db.products.find(x=>x.id===Number(id));if(p)openModal('Chỉnh sửa hàng hóa',productFields(p),'product',p);}
function startPerson(type='employees',data=null){const labels={employees:'nhân viên',suppliers:'nhà cung cấp',customers:'khách hàng'};const fields=[{name:'name',label:'Họ và tên / tên đơn vị',required:true,full:true,placeholder:'Nhập tên...'},{name:'role',label:type==='employees'?'Chức vụ':'Nhóm / vai trò',required:true,placeholder:'Nhập vai trò...'},{name:'phone',label:'Số điện thoại',required:true,placeholder:'09xx xxx xxx'},{name:'email',label:'Email',type:'email',placeholder:'email@example.com'},{name:'address',label:'Địa chỉ',full:true,placeholder:'Địa chỉ liên hệ'}];if(type==='employees')fields.push({name:'salary',label:'Lương (VNĐ)',type:'number',min:0,step:100000,value:0});pendingPersonType=type;openModal(data?'Chỉnh sửa hồ sơ':`Thêm ${labels[type]}`,fields,'person',data||null);}
function startStock(id=null,adjust=false){const p=id?db.products.find(x=>x.id===Number(id)):null;const fields=[{name:'productId',label:'Hàng hóa',type:'select',required:true,options:db.products.map(x=>String(x.id)+'|'+x.name+' ('+x.qty+' '+x.unit+')'),value:p?String(p.id)+'|'+p.name+' ('+p.qty+' '+p.unit+')':db.products[0]?String(db.products[0].id)+'|'+db.products[0].name+' ('+db.products[0].qty+' '+db.products[0].unit+')':''},{name:'qty',label:adjust?'Số lượng tồn mới':'Số lượng nhập thêm',type:'number',required:true,min:0,step:1,value:1},{name:'note',label:'Ghi chú',placeholder:'Ví dụ: Nhập từ nhà cung cấp',full:true}];openModal(adjust?'Điều chỉnh tồn kho':'Nhập hàng vào kho',fields,adjust?'adjust-stock':'stock');}
function startSale(){if(!db.products.length){toast('Hãy thêm hàng hóa trước khi tạo hóa đơn.',false);return;}const productOptions=db.products.map(p=>`${p.id}|${p.name} · ${money(p.price)} · tồn ${p.qty}`).join(';;');openModal('Tạo hóa đơn bán hàng',[{name:'customer',label:'Tên khách hàng',required:true,placeholder:'Khách lẻ hoặc tên khách hàng',value:'Khách lẻ',full:true},{name:'productId',label:'Chọn hàng hóa',type:'select',required:true,options:productOptions.split(';;'),value:productOptions.split(';;')[0]},{name:'qty',label:'Số lượng bán',type:'number',required:true,min:1,step:1,value:1},{name:'note',label:'Ghi chú hóa đơn',placeholder:'Không bắt buộc',full:true}],'sale');}
function csvDownload(filename,rows){const csv=rows.map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);toast('Đã xuất tệp CSV.');}
function removeProduct(id){const p=db.products.find(x=>x.id===Number(id));if(!p)return;if(!confirm(`Xóa hàng hóa “${p.name}”?`))return;db.products=db.products.filter(x=>x.id!==p.id);save();renderAll();toast('Đã xóa hàng hóa.');}
function removePerson(id){const p=db.people.find(x=>x.id===Number(id));if(!p)return;if(!confirm(`Xóa hồ sơ “${p.name}”?`))return;db.people=db.people.filter(x=>x.id!==p.id);save();renderAll();toast('Đã xóa hồ sơ.');}
function submitModal(e){e.preventDefault();if(formType==='quick')return;const data=Object.fromEntries(new FormData(e.currentTarget).entries());if(formType==='product'){data.buy=Number(data.buy);data.price=Number(data.price);data.qty=Number(data.qty);data.min=Number(data.min);data.id=editing?.id||Date.now();data.image=data.image.trim()||imageFor[data.category]||productImages[0];if(editing){db.products=db.products.map(p=>p.id===editing.id?{...p,...data}:p);toast('Đã cập nhật hàng hóa.');}else{if(db.products.some(p=>p.code.toLowerCase()===data.code.toLowerCase())){toast('Mã hàng đã tồn tại, hãy dùng mã khác.',false);return;}db.products.unshift(data);toast('Đã thêm hàng hóa mới.');}}
 else if(formType==='person'){data.type=editing?.type||pendingPersonType;data.salary=Number(data.salary||0);data.id=editing?.id||Date.now();if(editing){db.people=db.people.map(p=>p.id===editing.id?{...p,...data}:p);toast('Đã cập nhật hồ sơ.');}else{db.people.unshift(data);toast('Đã thêm hồ sơ mới.');}}
 else if(formType==='stock'||formType==='adjust-stock'){const id=Number(data.productId.split('|')[0]);const p=db.products.find(x=>x.id===id);if(!p){toast('Không tìm thấy hàng hóa.',false);return;}const q=Number(data.qty);if(formType==='adjust-stock')p.qty=q;else p.qty+=q;toast(formType==='adjust-stock'?'Đã điều chỉnh tồn kho.':'Nhập kho thành công.');}
 else if(formType==='sale'){const id=Number(data.productId.split('|')[0]);const p=db.products.find(x=>x.id===id);const q=Number(data.qty);if(!p||q<1){toast('Thông tin hóa đơn không hợp lệ.',false);return;}if(q>p.qty){toast(`Tồn kho chỉ còn ${p.qty} ${p.unit}.`,false);return;}p.qty-=q;const sale={id:Date.now(),code:'HD'+Date.now().toString().slice(-6),customer:data.customer.trim(),date:today(),items:[{productId:p.id,name:p.name,qty:q,price:p.price}],total:p.price*q,note:data.note};db.sales.push(sale);toast('Tạo hóa đơn thành công, tồn kho đã cập nhật.');}
 save();closeModal();renderAll();}
function deleteSale(id){const s=db.sales.find(x=>x.id===Number(id));if(!s)return;if(!confirm(`Xóa hóa đơn ${s.code}? Số lượng hàng sẽ được hoàn lại kho.`))return;s.items.forEach(it=>{const p=db.products.find(p=>p.id===it.productId);if(p)p.qty+=it.qty;});db.sales=db.sales.filter(x=>x.id!==s.id);save();renderAll();toast('Đã xóa hóa đơn và hoàn lại tồn kho.');}
function viewSale(id){const s=db.sales.find(x=>x.id===Number(id));if(!s)return;const detail=s.items.map(x=>`${x.name} × ${x.qty} = ${money(x.price*x.qty)}`).join('\n');alert(`HÓA ĐƠN ${s.code}\nKhách hàng: ${s.customer}\nNgày: ${s.date}\n\n${detail}\n\nTỔNG TIỀN: ${money(s.total)}${s.note?'\nGhi chú: '+s.note:''}`);}
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
document.addEventListener('click',e=>{
 const action=e.target.closest('[data-action]')?.dataset.action;if(action){if(action==='add-product')startAddProduct();if(action==='add-person')startPerson(personTab);if(action==='stock-in')startStock();if(action==='new-sale')startSale();}
 const goto=e.target.closest('[data-goto]')?.dataset.goto;if(goto)go(goto);
 const ep=e.target.closest('[data-edit-product]')?.dataset.editProduct;if(ep)startEditProduct(ep);
 const sp=e.target.closest('[data-stock-product]')?.dataset.stockProduct;if(sp)startStock(sp);
 const ap=e.target.closest('[data-adjust-product]')?.dataset.adjustProduct;if(ap)startStock(ap,true);
 const dp=e.target.closest('[data-delete-product]')?.dataset.deleteProduct;if(dp)removeProduct(dp);
 const personEdit=e.target.closest('[data-edit-person]')?.dataset.editPerson;if(personEdit){const p=db.people.find(x=>x.id===Number(personEdit));if(p)startPerson(p.type,p);}
 const personDelete=e.target.closest('[data-delete-person]')?.dataset.deletePerson;if(personDelete)removePerson(personDelete);
 const vs=e.target.closest('[data-view-sale]')?.dataset.viewSale;if(vs)viewSale(vs);
 const ds=e.target.closest('[data-delete-sale]')?.dataset.deleteSale;if(ds)deleteSale(ds);
 const tw=e.target.closest('[data-toggle-week]')?.dataset.toggleWeek;if(tw!==undefined){db.roadmap[Number(tw)]=!db.roadmap[Number(tw)];save();renderRoadmap();toast(db.roadmap[Number(tw)]?'Đã đánh dấu tuần hoàn thành.':'Đã bỏ đánh dấu tuần.');}
});
$$('[data-person-tab]').forEach(b=>b.addEventListener('click',()=>{personTab=b.dataset.personTab;renderPeople();}));
$('#modalForm').addEventListener('submit',submitModal);$('#closeModal').addEventListener('click',closeModal);$('#cancelModal').addEventListener('click',closeModal);$('#modalBackdrop').addEventListener('click',e=>{if(e.target===$('#modalBackdrop'))closeModal();});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
$('#productSearch').addEventListener('input',renderProducts);$('#categoryFilter').addEventListener('change',renderProducts);$('#stockFilter').addEventListener('change',renderProducts);$('#inventorySearch').addEventListener('input',renderInventory);$('#salesSearch').addEventListener('input',renderSales);$('#peopleSearch').addEventListener('input',renderPeople);
$('#quickAdd').addEventListener('click',()=>openModal('Thêm nhanh dữ liệu',[{name:'kind',label:'Bạn muốn thêm gì?',type:'select',required:true,options:['Hàng hóa','Nhân viên','Nhà cung cấp','Khách hàng','Hóa đơn bán hàng']}],'quick'));
$('#modalForm').addEventListener('submit',e=>{if(formType!=='quick')return; e.preventDefault();const kind=new FormData(e.currentTarget).get('kind');closeModal();if(kind==='Hàng hóa')startAddProduct();else if(kind==='Hóa đơn bán hàng')startSale();else startPerson(({ 'Nhân viên':'employees','Nhà cung cấp':'suppliers','Khách hàng':'customers'})[kind]);});
$('#exportProducts').addEventListener('click',()=>csvDownload('danh-sach-hang-hoa.csv',[['Mã hàng','Tên hàng','Danh mục','Giá nhập','Giá bán','Tồn kho','Đơn vị'],...db.products.map(p=>[p.code,p.name,p.category,p.buy,p.price,p.qty,p.unit])]));
$('#exportPeople').addEventListener('click',()=>csvDownload('danh-sach-nhan-su-doi-tac.csv',[['Loại','Tên','Vai trò','Điện thoại','Email','Địa chỉ'],...db.people.filter(p=>p.type===personTab).map(p=>[p.type,p.name,p.role,p.phone,p.email,p.address])]));
$('#exportReport').addEventListener('click',()=>csvDownload('bao-cao-novamart.csv',[['Chỉ tiêu','Giá trị'],['Tổng hàng hóa',db.products.length],['Tổng doanh thu',totals().revenue],['Giá trị tồn kho',totals().stock],['Tổng số lượng tồn',totals().units],['Hàng sắp hết',totals().low],[],['Mã hàng','Tên hàng','Danh mục','Giá nhập','Giá bán','Tồn kho'],...db.products.map(p=>[p.code,p.name,p.category,p.buy,p.price,p.qty])]));
$('#resetDemo').addEventListener('click',()=>{if(confirm('Khôi phục toàn bộ dữ liệu mẫu? Các thay đổi hiện tại sẽ bị xóa.')){db=structuredClone(initial);save();renderAll();toast('Đã khôi phục dữ liệu demo.');}});
$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
renderAll();