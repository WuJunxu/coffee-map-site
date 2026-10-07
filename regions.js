/* ============================================================
   世界咖啡产区 / 庄园点位数据库
   字段：
     n  中文名      en 英文名        ct 所属国家
     la 纬度        lo 经度
     a  [最低海拔, 最高海拔] m
     sp 豆种大类 arabica / robusta / both / liberica
     va 品种（cultivar）名称
     pr 主要处理法 washed 水洗 / natural 日晒 / honey 蜜处理
        / wethulled 湿刨 / pulped 半日晒(去果皮日晒) / special 特殊处理
     ro 常见烘焙区间 [下,上]  1浅 2中浅 3中 4中深 5深
     fl 风味描述
     lv 1=图面常显注记（一级产区），0=仅交互显示
     nt 备注
     sub 著名子产区（有则收录）：
         [{n 中文名, en 英文名, t 单元类型, a [最低海拔,最高海拔],
           pr 主要处理法, nt 一句介绍}]
     sn  子产区划分口径说明（可选；解释该国的产区层级是怎么切的）
   ------------------------------------------------------------
   关于 sub 的两点口径说明：
     · 子产区的「层级」各国并不统一 —— 埃塞俄比亚是 woreda（县）或处理站，
       哥伦比亚是 municipio（市镇），肯尼亚是水洗站，巴拿马是庄园地块。
       因此每个子产区都带 t 字段标明它属于哪一种单元，不可横向比较大小。
     · 只在「该名字在市面上被单独标名流通」时才收录，避免把行政区名录
       当成产区名录。没有可靠子产区的一律留空，不编。
   ------------------------------------------------------------
   数据性质说明：
     · 海拔、品种、处理法、风味为产区层面的常见区间与典型描述，
       同一产区内不同庄园会有差异。
     · 烘焙度不是产区固有属性，而是烘焙商针对该产区豆性的
       常见选择区间（标注于图例与卡片中）。
   ============================================================ */
const REGIONS = [
/* ---------- 东非 · 咖啡基因原产地 ---------- */
{n:"耶加雪菲",en:"Yirgacheffe",ct:"埃塞俄比亚",la:6.15,lo:38.20,a:[1750,2200],sp:"arabica",va:"原生种 Heirloom（铁皮卡系地方种）",pr:"washed",ro:[1,2],fl:"柠檬、佛手柑、茉莉、红茶、蜂蜜",lv:1,sub:[{"n":"科契尔","en":"Kochere","t":"admin","a":[1900,2100],"pr":"washed","nt":"与耶加雪菲镇并列的 woreda；水洗款柑橘、花香经典，日晒款莓果更重"},{"n":"维纳果","en":"Wenago","t":"admin","a":[1850,2050],"pr":"washed","nt":"耶加雪菲以南的 woreda，多数高海拔处理站落在境内"},{"n":"伊迪多","en":"Idido","t":"station","a":[1950,2150],"pr":"washed","nt":"处理站 + 村域地块名，非行政区；明亮花香型耶加的代表批次之一"},{"n":"孔加","en":"Konga","t":"station","a":[1900,2100],"pr":"washed","nt":"水洗站名，常以「Yirgacheffe Konga」整名流通"},{"n":"阿瑞恰","en":"Aricha","t":"station","a":[1900,2100],"pr":"washed","nt":"水洗站名，甜感与花香突出，是耶加最常被单独标名的站点之一"}],sn:"埃塞俄比亚的行政层级是 Region（州）→ Zone（区）→ Woreda（县）。市面上的「产区名」跨层级混用：西达摩是州（2020 年从 SNNPR 独立），古吉是 Oromia 州下的 Zone，而耶加雪菲只是 Gedeo Zone 下的一个 woreda —— 三者层级并不对等。子产区多为 woreda 或处理站名。",nt:"水洗与日晒并行；日晒款莓果调更重"},
{n:"西达摩",en:"Sidama / Sidamo",ct:"埃塞俄比亚",la:6.85,lo:38.48,a:[1600,2200],sp:"arabica",va:"原生种 Heirloom、74110、74158",pr:"washed",ro:[1,2],fl:"蓝莓、柑橘、花香、红酒感",lv:1,sub:[{"n":"班莎","en":"Bensa","t":"admin","a":[1900,2300],"pr":"natural","nt":"近年最热的日晒微产区；Bombe、Shantawene、Daye Bensa 等村域地块出自此 woreda"},{"n":"阿尔贝戈纳","en":"Arbegona","t":"admin","a":[2000,2350],"pr":"natural","nt":"海拔最高的咖啡 woreda 之一，日晒为主，酸质明亮、层次细"},{"n":"邦贝","en":"Bombe","t":"station","a":[1950,2200],"pr":"natural","nt":"Bensa woreda 内的村域地块 / 干燥站名，近年国际拍卖与比赛的常客"}],sn:"埃塞俄比亚的行政层级是 Region（州）→ Zone（区）→ Woreda（县）。市面上的「产区名」跨层级混用：西达摩是州（2020 年从 SNNPR 独立），古吉是 Oromia 州下的 Zone，而耶加雪菲只是 Gedeo Zone 下的一个 woreda —— 三者层级并不对等。子产区多为 woreda 或处理站名。",nt:"埃塞俄比亚产量最大的精品产区"},
{n:"古吉",en:"Guji / Shakiso",ct:"埃塞俄比亚",la:5.75,lo:38.92,a:[1800,2300],sp:"arabica",va:"原生种 Heirloom、74110",pr:"natural",ro:[1,2],fl:"蓝莓、水蜜桃、花香、酒渍果",lv:1,sub:[{"n":"罕贝拉","en":"Hambella（Hambela Wamena）","t":"admin","a":[1900,2300],"pr":"natural","nt":"「花魁」的来源地：Buku Abel 处理厂的日晒批次自 2017 年起在中国市场以「花魁」为名逐年编号流通 —— 这是批次名，不是品种名，也不是行政区名之外的另一个产区"},{"n":"乌拉嘎","en":"Uraga","t":"admin","a":[1900,2200],"pr":"natural","nt":"古吉最早成名的 woreda，日晒莓果与花香浓郁"},{"n":"安娜索拉","en":"Ana Sora","t":"admin","a":[1950,2300],"pr":"natural","nt":"古吉海拔最高的一批地块，酸质更明亮、层次更细"},{"n":"夏奇索","en":"Shakiso","t":"admin","a":[1800,2100],"pr":"natural","nt":"Guji Zone 的中心城镇；产区英文名常写作 Guji / Shakiso，后半段即来自此"},{"n":"格兰纳","en":"Gelana Gesha Farm","t":"estate","a":[1400,1800],"pr":"washed","nt":"Kerchanshe 旗下瑰夏庄园（创始人 Israel Degfa），常见批次 Gelana Washed Gesha G1；该批次风味：山楂、柠檬红茶、莓果、槐花蜜。【归属口径，重要】Kerchanshe 官网分支页把 Gelana 列在 Oromia 州 West Guji 区的 Tore／Gelana Woreda（村庄 Kersa），而其农场页与多数商品页写「耶加雪菲附近／耶加雪菲中心地带」—— 耶加雪菲属 Gedeo Zone（SNNP），与西谷吉相邻但不同区，后者属跨区营销表述，不可当作行政归属（Kerchanshe 分支页里 Kochere 单独列在 Gedeo，与该条并列，可反证）。【数值打架】海拔有 1350–1780 / 1400–1800 / 1350–2100 三种标法；面积 1.5 ha（温室与瑰夏种植区）与 750 ha（整个 Gelana 农场）并存 —— 均勿直接引用。"}],sn:"埃塞俄比亚的行政层级是 Region（州）→ Zone（区）→ Woreda（县）。市面上的「产区名」跨层级混用：西达摩是州（2020 年从 SNNPR 独立），古吉是 Oromia 州下的 Zone，而耶加雪菲只是 Gedeo Zone 下的一个 woreda —— 三者层级并不对等。子产区多为 woreda 或处理站名。",nt:"Guji 是 Oromia 州下的 Zone，其下含 Hambella、Uraga、Ana Sora、Shakiso 等 woreda；「花魁」是 2017 年起中国市场对 Hambella Buku Abel 处理厂日晒批次的命名 —— 批次名，不是品种名。"},
{n:"哈拉",en:"Harrar",ct:"埃塞俄比亚",la:9.31,lo:42.12,a:[1500,2100],sp:"arabica",va:"原生种 Heirloom（摩卡系）",pr:"natural",ro:[3,4],fl:"蓝莓果酱、酒渍果、黑巧、烟熏",lv:1,nt:"最古老的产区之一，传统全日晒，醇厚度高"},
{n:"利姆",en:"Limu",ct:"埃塞俄比亚",la:7.90,lo:36.90,a:[1600,2000],sp:"arabica",va:"原生种 Heirloom、74110",pr:"washed",ro:[2,3],fl:"柑橘、香料、坚果、黑巧",lv:0},
{n:"金比",en:"Jimma",ct:"埃塞俄比亚",la:7.67,lo:36.83,a:[1400,1800],sp:"arabica",va:"原生种 Heirloom、74112",pr:"natural",ro:[3,4],fl:"香料、坚果、草本、红茶",lv:0},
{n:"列坎普提",en:"Lekempti / Wellega",ct:"埃塞俄比亚",la:8.90,lo:36.60,a:[1500,1900],sp:"arabica",va:"原生种 Heirloom",pr:"natural",ro:[3,4],fl:"坚果、香料、巧克力",lv:0},

{n:"涅里",en:"Nyeri",ct:"肯尼亚",la:-0.42,lo:36.95,a:[1750,2100],sp:"arabica",va:"SL28、SL34、Ruiru 11、Batian、K7",pr:"washed",ro:[1,2],fl:"黑加仑、番茄、柑橘、乌梅",lv:1,sub:[{"n":"加通博亚","en":"Gatomboya","t":"station","a":[1800,2000],"pr":"washed","nt":"Nyeri 最著名的水洗站之一，黑加仑与乌梅调突出"},{"n":"卡姆万吉","en":"Kamwangi","t":"station","a":[1750,1950],"pr":"washed","nt":"柑橘与番茄调明显，批次稳定性高"},{"n":"吉查泰尼","en":"Gichathaini","t":"station","a":[1700,1950],"pr":"washed","nt":"常与 Karogoto、Kangocho 等水洗站并列出现在 Nyeri 批次名中"},{"n":"姆图艾尼","en":"Muthuaini","t":"station","a":[1800,2000],"pr":"washed","nt":"海拔偏高的水洗站，酸质明亮、甜感厚"}],sn:"肯尼亚以合作社（Co-operative Society）+ 水洗站（Factory / Wet Mill）为单位流通；AA、AB、PB 是豆粒大小分级，不是产区名。",nt:"肯尼亚酸质标杆；水洗发酵 + 水槽分级（AA/PB）"},
{n:"基里尼亚加",en:"Kirinyaga",ct:"肯尼亚",la:-0.62,lo:37.30,a:[1600,1900],sp:"arabica",va:"SL28、SL34、Ruiru 11",pr:"washed",ro:[1,2],fl:"黑加仑、柑橘、焦糖",lv:0},
{n:"恩布",en:"Embu",ct:"肯尼亚",la:-0.53,lo:37.45,a:[1500,1900],sp:"arabica",va:"SL28、SL34、Batian",pr:"washed",ro:[1,2],fl:"柑橘、莓果、黑加仑",lv:0},
{n:"基安布",en:"Kiambu",ct:"肯尼亚",la:-1.17,lo:36.83,a:[1600,2000],sp:"arabica",va:"SL28、SL34、K7",pr:"washed",ro:[1,2],fl:"柑橘、花香、红茶",lv:0},
{n:"邦戈马",en:"Bungoma",ct:"肯尼亚",la:0.57,lo:34.56,a:[1400,1800],sp:"arabica",va:"SL28、Ruiru 11",pr:"washed",ro:[2,3],fl:"柑橘、坚果、焦糖",lv:0},

{n:"胡耶",en:"Huye",ct:"卢旺达",la:-2.58,lo:29.74,a:[1700,2100],sp:"arabica",va:"红波旁 Red Bourbon、Mibirizi",pr:"washed",ro:[1,2],fl:"红茶、柑橘、花香、蜂蜜",lv:1,sub:[{"n":"马拉巴","en":"Maraba（Abahuzamugambi）","t":"station","a":[1700,2100],"pr":"washed","nt":"卢旺达最早走向精品市场的水洗站之一，女性合作社体系成熟"}],nt:"女性合作社（如 Abahuzamugambi）体系成熟"},
{n:"尼亚马西凯",en:"Nyamasheke",ct:"卢旺达",la:-2.35,lo:29.10,a:[1600,2100],sp:"arabica",va:"红波旁 Red Bourbon",pr:"washed",ro:[1,2],fl:"红茶、红果、柑橘、焦糖",lv:0},
{n:"鲁林多",en:"Rulindo",ct:"卢旺达",la:-1.72,lo:30.02,a:[1800,2200],sp:"arabica",va:"红波旁 Red Bourbon",pr:"washed",ro:[1,2],fl:"花香、柑橘、蜂蜜",lv:0},

{n:"卡扬扎",en:"Kayanza",ct:"布隆迪",la:-2.92,lo:29.63,a:[1700,2000],sp:"arabica",va:"红波旁 Red Bourbon、Mibirizi",pr:"washed",ro:[1,2],fl:"柑橘、红茶、焦糖、红果",lv:0},

{n:"布吉苏",en:"Bugisu / Mt. Elgon",ct:"乌干达",la:1.08,lo:34.18,a:[1300,2200],sp:"both",va:"SL14、SL28、Nyasaland、罗布斯塔",pr:"washed",ro:[2,3],fl:"坚果、黑巧、柑橘、草本",lv:1,nt:"埃尔贡山火山土；乌干达精品主力（Bugisu AA）"},
{n:"鲁文佐里",en:"Rwenzori",ct:"乌干达",la:0.42,lo:30.00,a:[1400,1900],sp:"both",va:"SL14、Nyasaland、罗布斯塔",pr:"washed",ro:[2,3],fl:"巧克力、坚果、香料",lv:0},

{n:"乞力马扎罗",en:"Kilimanjaro / Moshi",ct:"坦桑尼亚",la:-3.35,lo:37.34,a:[1300,1900],sp:"arabica",va:"Kent、N39、Bourbon、Blue Mountain",pr:"washed",ro:[2,3],fl:"柑橘、花香、黑巧、坚果",lv:0},
{n:"姆贝亚",en:"Mbeya",ct:"坦桑尼亚",la:-8.90,lo:33.45,a:[1400,1900],sp:"arabica",va:"Kent、N39、Bourbon",pr:"washed",ro:[2,3],fl:"坚果、柑橘、焦糖",lv:0},
{n:"鲁伍马",en:"Ruvuma",ct:"坦桑尼亚",la:-10.55,lo:35.65,a:[1200,1800],sp:"arabica",va:"Kent、N39",pr:"washed",ro:[2,3],fl:"柑橘、香料、巧克力",lv:0},

{n:"基伍湖区",en:"Kivu（北基伍 / 贝尼）",ct:"刚果（金）",la:-0.50,lo:29.30,a:[1400,2000],sp:"both",va:"罗布斯塔为主，兼有阿拉比卡（Blue Mountain、SL28）",pr:"washed",ro:[3,4],fl:"木质、黑巧、香料、坚果",lv:0},
{n:"巴门达高地",en:"Bamenda Highlands",ct:"喀麦隆",la:5.96,lo:10.15,a:[1200,1800],sp:"both",va:"Java（Boyo）、Java Robusta",pr:"washed",ro:[3,4],fl:"柑橘、坚果、黑巧、香料",lv:0},
{n:"加尼奥阿",en:"Gagnoa",ct:"科特迪瓦",la:6.13,lo:-5.95,a:[100,400],sp:"robusta",va:"罗布斯塔 Robusta",pr:"natural",ro:[5,5],fl:"苦、木质、谷物、烟熏",lv:0},
{n:"安博因",en:"Amboim / Gabela",ct:"安哥拉",la:-10.85,lo:14.37,a:[1000,1400],sp:"both",va:"罗布斯塔、铁皮卡、波旁（老种）",pr:"natural",ro:[4,5],fl:"香料、木质、巧克力",lv:0,nt:"1970s 前非洲第二大产国，内战后复产中"},
{n:"瓦基南卡拉特拉",en:"Vakinankaratra",ct:"马达加斯加",la:-19.87,lo:47.03,a:[1200,1600],sp:"arabica",va:"波旁、铁皮卡、Jackson",pr:"washed",ro:[2,3],fl:"柑橘、花香、红茶、蜂蜜",lv:0},
{n:"米苏库",en:"Misuku Hills",ct:"马拉维",la:-9.65,lo:33.45,a:[1200,1800],sp:"arabica",va:"Catimor、Nyasaland、Geisha",pr:"washed",ro:[1,2],fl:"柑橘、花香、蜂蜜",lv:0},
{n:"奇平格",en:"Chipinge",ct:"津巴布韦",la:-20.20,lo:32.62,a:[1000,1500],sp:"arabica",va:"Catimor、SL28、Geisha",pr:"washed",ro:[2,3],fl:"柑橘、花香、焦糖",lv:0},
{n:"圣赫勒拿",en:"St Helena",ct:"英国（圣赫勒拿岛）",la:-15.96,lo:-5.72,a:[300,600],sp:"arabica",va:"绿顶波旁 Green Tipped Bourbon（铁皮卡自然突变）",pr:"washed",ro:[2,3],fl:"柑橘、花香、奶油、干净柔顺",lv:1,nt:"拿破仑流放地；全球最偏远的商业产区，年产量仅数吨"},

/* ---------- 阿拉伯半岛 ---------- */
{n:"哈拉兹",en:"Haraaz",ct:"也门",la:15.10,lo:43.72,a:[1500,2200],sp:"arabica",va:"摩卡古种：Udaini、Dawairi、Tuffahi、Duani",pr:"natural",ro:[3,4],fl:"干果、香料、黑巧、酒香、烟熏",lv:1,nt:"摩卡港的历史货源地；梯田日晒，豆粒小而不规则"},
{n:"萨那尼",en:"Sana'ani",ct:"也门",la:15.35,lo:44.20,a:[1500,2000],sp:"arabica",va:"摩卡古种：Udaini、Dawairi",pr:"natural",ro:[3,4],fl:"干果、巧克力、豆蔻、皮革",lv:0},

/* ---------- 亚洲 ---------- */
{n:"奇克马加卢尔",en:"Chikmagalur",ct:"印度",la:13.32,lo:75.77,a:[1000,1500],sp:"both",va:"S795、Selection 9、Cauvery、Chandragiri",pr:"washed",ro:[3,4],fl:"香料、坚果、黑巧、柔和柑橘",lv:1,nt:"印度咖啡发源地（巴巴布丹传入）"},
{n:"库格",en:"Coorg / Kodagu",ct:"印度",la:12.42,lo:75.74,a:[900,1500],sp:"both",va:"S795、罗布斯塔 CxR、Old Chick",pr:"natural",ro:[4,5],fl:"香料、木质、坚果、烟熏",lv:0},
{n:"尼尔吉里",en:"Nilgiris / Coonoor",ct:"印度",la:11.35,lo:76.79,a:[1000,1800],sp:"arabica",va:"S795、Selection 9",pr:"washed",ro:[3,4],fl:"柑橘、花香、坚果",lv:0},
{n:"季风马拉巴尔",en:"Monsooned Malabar",ct:"印度",la:12.87,lo:74.88,a:[0,300],sp:"both",va:"S795、罗布斯塔（经季风处理）",pr:"special",ro:[4,5],fl:"低酸、谷仓、木质、皮革、香料",lv:1,nt:"西南季风期敞开仓储 3–4 个月，豆体膨胀泛黄、酸度几乎消失"},

{n:"保山",en:"Baoshan",ct:"中国",la:25.12,lo:99.17,a:[1000,1600],sp:"arabica",va:"卡蒂姆 Catimor、铁皮卡、波旁",pr:"washed",ro:[3,4],fl:"坚果、茶感、焦糖、柔和果酸",lv:1,sub:[{"n":"潞江坝","en":"Lujiangba","t":"admin","a":[800,1300],"pr":"washed","nt":"怒江干热河谷，云南最早的规模化咖啡种植区，海拔低、昼夜温差大"},{"n":"新寨村","en":"Xinzhai","t":"estate","a":[1000,1400],"pr":"washed","nt":"隆阳区潞江镇下辖村，被称为「中国咖啡第一村」，近年精品化最快"},{"n":"隆阳区","en":"Longyang","t":"admin","a":[900,1600],"pr":"washed","nt":"保山咖啡主产县级区，潞江坝与新寨村均在其境内"}],sn:"云南产区以县 / 镇为单位划分，精品庄园与地块级命名起步较晚，近年才开始出现庄园级批次。",nt:"中国最早规模化产区，潞江坝干热河谷"},
{n:"普洱",en:"Pu'er",ct:"中国",la:22.78,lo:100.97,a:[1000,1500],sp:"arabica",va:"卡蒂姆 Catimor、铁皮卡、波旁",pr:"washed",ro:[3,4],fl:"坚果、巧克力、茶感、红糖",lv:1,sub:[{"n":"孟连","en":"Menglian","t":"admin","a":[1000,1500],"pr":"washed","nt":"傣族拉祜族自治县，精品庄园与处理厂最集中"},{"n":"澜沧","en":"Lancang","t":"admin","a":[1000,1500],"pr":"washed","nt":"种植面积最大的县，也是普洱产量的主力"},{"n":"宁洱","en":"Ning'er","t":"admin","a":[1000,1400],"pr":"washed","nt":"北回归线穿过的传统种植县，普洱咖啡最早一批规模化园地在此"}],sn:"云南产区以县 / 镇为单位划分，精品庄园与地块级命名起步较晚，近年才开始出现庄园级批次。",nt:"中国最大咖啡产区，近年精品化最快"},
{n:"临沧",en:"Lincang",ct:"中国",la:23.88,lo:100.09,a:[1100,1600],sp:"arabica",va:"卡蒂姆 Catimor、铁皮卡",pr:"washed",ro:[3,4],fl:"核果、焦糖、坚果",lv:0},
{n:"德宏",en:"Dehong / Mangshi",ct:"中国",la:24.43,lo:98.58,a:[900,1400],sp:"arabica",va:"卡蒂姆 Catimor、S288",pr:"natural",ro:[3,4],fl:"坚果、巧克力、香料",lv:0},

{n:"邦美蜀",en:"Buon Ma Thuột / Đắk Lắk",ct:"越南",la:12.67,lo:108.05,a:[400,800],sp:"robusta",va:"罗布斯塔 TR4、TR9、TR11；少量卡蒂姆",pr:"natural",ro:[5,5],fl:"苦、黑巧、木质、谷物、坚果",lv:1,nt:"全球罗布斯塔核心产区；越南冰奶咖啡（深烘 + 炼乳）的原料地"},
{n:"大叻",en:"Đà Lạt / Lâm Đồng",ct:"越南",la:11.94,lo:108.44,a:[1400,1600],sp:"arabica",va:"卡蒂姆 Catimor、波旁、铁皮卡",pr:"washed",ro:[2,3],fl:"花香、柑橘、蜂蜜",lv:0},
{n:"山萝",en:"Sơn La",ct:"越南",la:21.33,lo:103.90,a:[800,1200],sp:"arabica",va:"卡蒂姆 Catimor、TN1",pr:"washed",ro:[3,4],fl:"坚果、巧克力、柔和酸",lv:0},

{n:"波罗芬高原",en:"Bolaven Plateau",ct:"老挝",la:15.18,lo:106.25,a:[1000,1350],sp:"both",va:"卡蒂姆、铁皮卡、罗布斯塔",pr:"washed",ro:[2,3],fl:"花香、柑橘、草本、蜂蜜",lv:1,sub:[{"n":"帕克松","en":"Paksong","t":"admin","a":[1000,1350],"pr":"washed","nt":"属 Champasak 省，老挝咖啡产业的地理中心与集散地"},{"n":"达登","en":"Thateng","t":"admin","a":[800,1200],"pr":"natural","nt":"属 Sekong 省一侧，海拔偏低，罗布斯塔比例更高"}],nt:"玄武岩高原；法殖时期引入，亚洲少见的高海拔罗布斯塔"},
{n:"黎昌山",en:"Doi Chang",ct:"泰国",la:19.93,lo:99.42,a:[1200,1500],sp:"arabica",va:"卡蒂姆、Chiang Mai 80",pr:"washed",ro:[2,3],fl:"坚果、柑橘、焦糖、花香",lv:0},
{n:"董山",en:"Doi Tung",ct:"泰国",la:20.28,lo:99.83,a:[900,1300],sp:"arabica",va:"卡蒂姆、Chiang Mai 80",pr:"washed",ro:[3,4],fl:"柑橘、坚果、黑巧",lv:0},
{n:"彬乌伦",en:"Pyin Oo Lwin",ct:"缅甸",la:22.03,lo:96.46,a:[1000,1500],sp:"arabica",va:"S795、卡蒂姆、波旁",pr:"washed",ro:[3,4],fl:"坚果、柑橘、香料",lv:0},
{n:"萨加达",en:"Sagada / Benguet",ct:"菲律宾",la:16.90,lo:120.90,a:[1200,1600],sp:"arabica",va:"铁皮卡、波旁、卡蒂姆",pr:"washed",ro:[2,3],fl:"花香、柑橘、焦糖",lv:0},
{n:"基达帕万",en:"Kidapawan",ct:"菲律宾",la:7.00,lo:125.09,a:[600,1200],sp:"robusta",va:"罗布斯塔 Robusta",pr:"natural",ro:[5,5],fl:"苦、木质、坚果",lv:0},

{n:"林东·曼特宁",en:"Lintong / Mandheling",ct:"印度尼西亚",la:2.53,lo:98.87,a:[1300,1600],sp:"arabica",va:"铁皮卡系地方种、Ateng、Jember、Sigararutang",pr:"wethulled",ro:[4,5],fl:"药草、雪松、黑巧、湿土、极醇厚、低酸",lv:1,nt:"湿刨法（Giling Basah）：含水率 30–50% 即脱壳，造就独特青草与木质调"},
{n:"盖优·亚齐",en:"Gayo / Aceh",ct:"印度尼西亚",la:4.63,lo:96.85,a:[1300,1600],sp:"arabica",va:"Ateng、铁皮卡、Gayo 1/2",pr:"wethulled",ro:[4,5],fl:"药草、烟熏、黑巧、香料、木质",lv:1,sub:[{"n":"塔肯贡（中亚齐）","en":"Takengon / Aceh Tengah","t":"admin","a":[1300,1600],"pr":"wethulled","nt":"多哥湖（Lake Tawar）畔的高原县城，Gayo 咖啡的生产与集散中心"},{"n":"贝内尔美里亚","en":"Bener Meriah","t":"admin","a":[1200,1500],"pr":"wethulled","nt":"与中亚齐相邻的县，有机认证比例高"}],nt:"有机认证比例高，多哥湖（Lake Toba 北端高原）"},
{n:"西迪卡朗",en:"Sidikalang",ct:"印度尼西亚",la:2.75,lo:98.30,a:[1200,1500],sp:"arabica",va:"Ateng、铁皮卡、Sigararutang",pr:"wethulled",ro:[4,5],fl:"木质、草本、黑巧、烟草",lv:0},
{n:"托拉查",en:"Toraja / Sulawesi",ct:"印度尼西亚",la:-2.90,lo:119.90,a:[1400,1800],sp:"arabica",va:"S795、铁皮卡、Ateng",pr:"wethulled",ro:[4,5],fl:"药草、木质、香料、黑巧、雪松",lv:1,sub:[{"n":"恩雷康（卡洛西）","en":"Enrekang / Kalosi","t":"admin","a":[1300,1700],"pr":"wethulled","nt":"Toraja 以南的县；Sulawesi 老贸易名 Kalosi（Kalossi）的来源地之一"}],nt:"苏拉威西高地；托拉查家族小农 + 湿刨法"},
{n:"金塔马尼",en:"Kintamani / Bali",ct:"印度尼西亚",la:-8.25,lo:115.35,a:[1200,1600],sp:"arabica",va:"铁皮卡、S795、Bourbon",pr:"wethulled",ro:[2,3],fl:"柑橘、花香、明亮、干净",lv:0,nt:"Subak Abian 传统灌溉林农系统，湿刨法中罕见的明亮酸质"},
{n:"伊真·爪哇",en:"Blawan / Ijen",ct:"印度尼西亚",la:-7.95,lo:114.20,a:[1000,1600],sp:"both",va:"S795、铁皮卡、罗布斯塔",pr:"washed",ro:[3,4],fl:"坚果、香料、黑巧、草本",lv:0},
{n:"弗洛勒斯",en:"Flores / Bajawa",ct:"印度尼西亚",la:-8.78,lo:120.97,a:[1200,1700],sp:"arabica",va:"Ateng、铁皮卡、S795",pr:"wethulled",ro:[4,5],fl:"烟草、香料、黑巧、花香",lv:0},
{n:"埃尔梅拉",en:"Ermera",ct:"东帝汶",la:-8.75,lo:125.40,a:[800,1400],sp:"both",va:"帝汶杂交种 Timor Hybrid（阿拉比卡 × 罗布斯塔自然杂交）、铁皮卡",pr:"natural",ro:[3,4],fl:"木质、药草、巧克力、坚果",lv:0,nt:"Timor Hybrid 抗叶锈病的基因源头，现代抗病品种的亲本"},
{n:"西格里",en:"Sigri / Waghi Valley",ct:"巴布亚新几内亚",la:-5.85,lo:144.55,a:[1500,1800],sp:"arabica",va:"铁皮卡、Arusha、Blue Mountain、Signar",pr:"washed",ro:[2,3],fl:"柑橘、花香、焦糖、坚果",lv:1,nt:"南太平洋精品代表；水洗 + 阳光干燥"},
{n:"奥卡帕",en:"Okapa / Eastern Highlands",ct:"巴布亚新几内亚",la:-6.55,lo:145.60,a:[1400,1900],sp:"arabica",va:"铁皮卡、Arusha、Catimor",pr:"washed",ro:[2,3],fl:"柑橘、焦糖、坚果、香料",lv:0},
{n:"马里巴",en:"Mareeba / Skybury",ct:"澳大利亚",la:-17.00,lo:145.40,a:[400,800],sp:"arabica",va:"K7、Red Catuai、自有选育种",pr:"washed",ro:[3,4],fl:"坚果、巧克力、柔和柑橘",lv:0,nt:"发达国家罕见的机械化采收产区，人工成本极高"},

/* ---------- 美洲 ---------- */
{n:"科纳",en:"Kona",ct:"美国（夏威夷）",la:19.55,lo:-155.92,a:[150,750],sp:"arabica",va:"科纳铁皮卡 Kona Typica",pr:"washed",ro:[3,4],fl:"坚果、焦糖、柑橘、奶油、极均衡",lv:1,sub:[{"n":"北科纳","en":"North Kona","t":"admin","a":[150,750],"pr":"washed","nt":"含 Holualoa、Kailua-Kona 一带的传统庄园群"},{"n":"南科纳","en":"South Kona","t":"admin","a":[150,750],"pr":"washed","nt":"含 Captain Cook、Hōnaunau 一带，海拔梯度更陡、批次差异更大"}],sn:"Kona 咖啡的法定产区（Kona Coffee Belt）限定在 North Kona 与 South Kona 两个区、长约 30 km 宽约 3 km 的火山坡带上；带外所产不能叫 Kona。",nt:"美国唯一商业化产区，火山坡地 + 午后云荫，人工采摘成本全球最高"},
{n:"卡乌",en:"Ka'ū",ct:"美国（夏威夷）",la:19.22,lo:-155.53,a:[300,800],sp:"arabica",va:"铁皮卡、波旁、Yellow Catuai",pr:"washed",ro:[3,4],fl:"花香、焦糖、柑橘、蜂蜜",lv:0},
{n:"尧科",en:"Yauco",ct:"波多黎各",la:18.04,lo:-66.85,a:[600,1000],sp:"arabica",va:"铁皮卡、波旁、Fronton",pr:"washed",ro:[3,4],fl:"坚果、巧克力、柔和酸",lv:0},
{n:"蓝山",en:"Blue Mountain",ct:"牙买加",la:18.05,lo:-76.65,a:[900,1700],sp:"arabica",va:"铁皮卡 Typica",pr:"washed",ro:[3,3],fl:"极均衡、柔和酸、坚果、牛奶巧克力、干净",lv:1,sub:[{"n":"圣安德鲁","en":"St. Andrew","t":"admin","a":[900,1700],"pr":"washed","nt":"四个法定教区中历史最久的一个，靠近金斯敦"},{"n":"波特兰","en":"Portland","t":"admin","a":[900,1600],"pr":"washed","nt":"东北部多雨，蓝山东段的主要产区"},{"n":"圣托马斯","en":"St. Thomas","t":"admin","a":[900,1500],"pr":"washed","nt":"最东端的法定教区，产量相对小"},{"n":"圣玛丽","en":"St. Mary","t":"admin","a":[700,1200],"pr":"washed","nt":"北部教区，海拔偏低，处在法定范围的边缘"},{"n":"梅维斯班克","en":"Mavis Bank","t":"estate","a":[900,1400],"pr":"washed","nt":"最著名的蓝山庄园之一，位于 St. Andrew 教区内"}],sn:"法定蓝山产区仅限 St. Andrew、St. Thomas、Portland、St. Mary 四个教区（Parish）海拔约 550–1700 m 的范围；范围外只能称 Jamaica High Mountain / Prime，不能叫蓝山。",nt:"法定产区上限 1700 m，历史上长期由日本商社包销"},
{n:"马埃斯特腊山",en:"Sierra Maestra",ct:"古巴",la:20.10,lo:-76.50,a:[600,1200],sp:"arabica",va:"铁皮卡、卡杜拉（Cubita）",pr:"washed",ro:[4,5],fl:"烟熏、黑巧、香料、焦糖",lv:0,nt:"革命山区；古巴内销为主，出口量少"},
{n:"巴拉奥纳",en:"Barahona",ct:"多米尼加",la:18.20,lo:-71.10,a:[800,1400],sp:"arabica",va:"铁皮卡、卡杜拉、波旁",pr:"washed",ro:[3,4],fl:"柑橘、黑巧、坚果、香料",lv:0},
{n:"蒂奥特",en:"Thiotte",ct:"海地",la:18.25,lo:-71.78,a:[1000,1400],sp:"arabica",va:"铁皮卡 Typica（老种）",pr:"washed",ro:[3,4],fl:"柑橘、花香、黑巧",lv:0},

{n:"圣安娜",en:"Santa Ana",ct:"萨尔瓦多",la:13.92,lo:-89.85,a:[1300,1800],sp:"arabica",va:"波旁 Bourbon、Pacas、Pacamara",pr:"washed",ro:[3,4],fl:"焦糖、柑橘、黑巧、蜂蜜",lv:1,nt:"Pacamara（象豆 × 波旁）由此走向世界"},
{n:"阿洛特佩克",en:"Alotepec-Metapán",ct:"萨尔瓦多",la:14.30,lo:-89.50,a:[1400,1700],sp:"arabica",va:"波旁、卡杜拉、Pacas",pr:"honey",ro:[3,4],fl:"柑橘、焦糖、花香",lv:0},
{n:"圣芭芭拉",en:"Santa Bárbara",ct:"洪都拉斯",la:14.92,lo:-88.24,a:[1400,1700],sp:"arabica",va:"卡杜拉、波旁、Lempira、IHCAFE 90、Parainema",pr:"washed",ro:[2,3],fl:"柑橘、蜜桃、焦糖、花香",lv:1,sub:[{"n":"埃尔谢利托","en":"El Cielito","t":"hill","a":[1600,1800],"pr":"washed","nt":"Santa Bárbara 市镇内海拔最高的地块名，常以单一庄园批次流通"},{"n":"圣文森特","en":"San Vicente","t":"hill","a":[1550,1750],"pr":"washed","nt":"以 Finca San Vicente 为中心的村落地块群，COE 获奖最集中的一处"},{"n":"拉萨尔萨","en":"La Salsa","t":"hill","a":[1500,1700],"pr":"washed","nt":"热带水果与柑橘调突出，批次辨识度高"},{"n":"埃尔普恩特","en":"El Puente","t":"estate","a":[1500,1700],"pr":"washed","nt":"Marysabel Caballero 家族庄园，洪都拉斯 COE 冠军常客"}],sn:"洪都拉斯以市镇 + 地块 / 庄园为单位流通，COE 竞赛与出口标签常见「庄园 + 地块」两级命名。",nt:"近年杯测赛（COE）冠军常客"},
{n:"蒙德西犹斯",en:"Montecillos / Marcala",ct:"洪都拉斯",la:14.15,lo:-87.98,a:[1200,1600],sp:"arabica",va:"卡杜拉、Lempira、IHCAFE 90",pr:"washed",ro:[3,4],fl:"焦糖、柑橘、巧克力",lv:0},
{n:"科潘",en:"Copán",ct:"洪都拉斯",la:14.83,lo:-88.77,a:[1000,1500],sp:"arabica",va:"卡杜拉、Lempira",pr:"washed",ro:[3,4],fl:"坚果、黑巧、柑橘",lv:0},
{n:"阿加尔塔",en:"Agalta",ct:"洪都拉斯",la:14.85,lo:-86.30,a:[1100,1600],sp:"arabica",va:"卡杜拉、Lempira",pr:"washed",ro:[3,4],fl:"柑橘、焦糖、香料",lv:0},
{n:"新塞哥维亚",en:"Nueva Segovia / Dipilto",ct:"尼加拉瓜",la:13.72,lo:-86.50,a:[1200,1700],sp:"arabica",va:"卡杜拉、卡图艾、象豆 Maragogype、Javanica",pr:"washed",ro:[2,3],fl:"柑橘、花香、巧克力、蜂蜜",lv:1,sub:[{"n":"莫桑特","en":"Mozonte","t":"admin","a":[1300,1600],"pr":"washed","nt":"与 Dipilto 相邻的市镇，同属最高海拔带"},{"n":"哈拉帕","en":"Jalapa","t":"admin","a":[1200,1600],"pr":"washed","nt":"与洪都拉斯接壤的市镇，批次常单列出口"},{"n":"圣费尔南多","en":"San Fernando","t":"admin","a":[1200,1600],"pr":"washed","nt":"省境中部市镇，甜感与巧克力调更突出"}],sn:"尼加拉瓜以省（departamento）+ 市镇（municipio）划分，出口标签常写到市镇一级。",nt:"尼加拉瓜最高海拔产区，酸质最明亮"},
{n:"希诺特加",en:"Jinotega",ct:"尼加拉瓜",la:13.09,lo:-86.00,a:[1100,1700],sp:"arabica",va:"卡杜拉、卡图艾、Catimor",pr:"washed",ro:[3,4],fl:"巧克力、坚果、柑橘",lv:0},
{n:"马塔加尔帕",en:"Matagalpa",ct:"尼加拉瓜",la:12.93,lo:-85.92,a:[1000,1500],sp:"arabica",va:"卡杜拉、卡图艾、Catimor",pr:"washed",ro:[3,4],fl:"坚果、焦糖、柔和酸",lv:0},

{n:"塔拉苏",en:"Tarrazú",ct:"哥斯达黎加",la:9.66,lo:-84.01,a:[1400,1900],sp:"arabica",va:"卡杜拉、卡图艾、Villa Sarchí",pr:"honey",ro:[3,4],fl:"蜂蜜、柑橘、黑巧、焦糖、饱满",lv:1,sub:[{"n":"圣玛丽亚·德·多塔","en":"Santa María de Dota","t":"admin","a":[1500,1900],"pr":"honey","nt":"Coopedota 合作社所在地，蜜处理与碳中和认证的标杆"},{"n":"圣马科斯·德·塔拉苏","en":"San Marcos de Tarrazú","t":"admin","a":[1400,1800],"pr":"honey","nt":"Tarrazú 县治所在地，蜜处理与日晒并行"},{"n":"亚诺博尼托","en":"Llano Bonito","t":"hill","a":[1500,1800],"pr":"honey","nt":"高海拔微地块，甜感与酸质平衡，甜橙调常见"}],sn:"哥斯达黎加以县（cantón）与合作社为单位流通，出口批次通常写到合作社一级。",nt:"蜜处理（Honey Process）的全球标杆；法律禁止种植罗布斯塔"},
{n:"纳兰霍",en:"Naranjo / West Valley",ct:"哥斯达黎加",la:10.08,lo:-84.38,a:[1300,1700],sp:"arabica",va:"卡杜拉、卡图艾、Villa Sarchí",pr:"honey",ro:[2,3],fl:"蜂蜜、花香、柑橘、杏",lv:0},
{n:"三河区",en:"Tres Ríos",ct:"哥斯达黎加",la:9.90,lo:-83.98,a:[1200,1600],sp:"arabica",va:"卡杜拉、卡图艾",pr:"washed",ro:[2,3],fl:"明亮酸、花香、柑橘",lv:0},
{n:"波奎特·沃尔坎",en:"Boquete–Volcán",ct:"巴拿马",la:8.78,lo:-82.50,a:[1400,1900],sp:"arabica",va:"瑰夏 Geisha、卡图艾、波旁、卡杜拉",pr:"washed",ro:[1,2],fl:"茉莉、佛手柑、白桃、热带水果、蜂蜜",lv:1,sub:[{"n":"哈拉米约","en":"Jaramillo","t":"hill","a":[1600,1800],"pr":"washed","nt":"翡翠庄园（La Esmeralda）核心地块；2004 年瑰夏在此拿下 BOP 冠军并一战成名"},{"n":"卡尼亚斯维尔德斯","en":"Cañas Verdes","t":"hill","a":[1600,1800],"pr":"washed","nt":"翡翠庄园另一核心地块，与 Jaramillo 并列为瑰夏的价格标杆"},{"n":"帕尔米拉","en":"Palmira","t":"hill","a":[1500,1800],"pr":"washed","nt":"Boquete 北侧的区域 / 地块名，多家庄园共用"},{"n":"埃尔韦洛","en":"El Velo","t":"hill","a":[1700,1900],"pr":"washed","nt":"Volcán 一侧的高海拔地块，酸质更明亮"}],sn:"巴拿马以庄园 + 地块（Lot）为单位流通，BOP 竞赛也是按「庄园 + 地块」报名，所以市面上的名字多为两级组合。",nt:"代表庄园：翡翠庄园（La Esmeralda）、艾利达（Elida）、阿尔铁里（Altieri）；2004 年瑰夏在此一战成名"},

{n:"安提瓜",en:"Antigua",ct:"危地马拉",la:14.56,lo:-90.73,a:[1500,1700],sp:"arabica",va:"波旁、卡杜拉、卡图艾",pr:"washed",ro:[3,4],fl:"黑巧、柑橘、香料、烟熏（火山浮石土）",lv:1,sub:[{"n":"圣米格尔·埃斯科瓦尔","en":"San Miguel Escobar","t":"estate","a":[1500,1700],"pr":"washed","nt":"Antigua 谷地西侧的火山区坡地庄园，浮石土典型"},{"n":"埃尔沃尔坎","en":"El Volcán","t":"estate","a":[1500,1700],"pr":"washed","nt":"正对 Agua 火山的坡地庄园，昼夜温差大"},{"n":"拉塞瓦","en":"La Ceiba","t":"estate","a":[1500,1650],"pr":"washed","nt":"谷地东南侧庄园，黑巧与香料调更重"}],sn:"Antigua 谷地范围很小（东西向仅约 20 km），市面上多以庄园名而非子产区名流通。",nt:"三面火山环抱，浮石土壤保水，昼夜温差大"},
{n:"薇薇特南果",en:"Huehuetenango",ct:"危地马拉",la:15.32,lo:-91.47,a:[1700,2000],sp:"arabica",va:"波旁、卡图艾、卡杜拉",pr:"washed",ro:[2,3],fl:"柑橘、花香、蜂蜜、明亮酸",lv:1,sub:[{"n":"康塞普西翁·维斯塔","en":"Concepción Huista","t":"admin","a":[1700,2000],"pr":"washed","nt":"西北部市镇，Huehuetenango 海拔最高的一块"},{"n":"哈卡尔特南果","en":"Jacaltenango","t":"admin","a":[1500,1900],"pr":"washed","nt":"西部市镇，盆地风带来干燥条件，干燥难度大但风味集中"},{"n":"阿瓜卡坦","en":"Aguacatán","t":"admin","a":[1500,1800],"pr":"washed","nt":"通往 Huehuetenango 的过渡地带，坚果与黑巧调更明显"}],nt:"危地马拉最高产区，无霜冻，海拔可达 2000 m"},
{n:"阿蒂特兰",en:"Atitlán",ct:"危地马拉",la:14.74,lo:-91.16,a:[1500,1700],sp:"arabica",va:"波旁、卡图艾、卡杜拉",pr:"washed",ro:[3,4],fl:"柑橘、黑巧、花香",lv:0},
{n:"科班",en:"Cobán",ct:"危地马拉",la:15.47,lo:-90.37,a:[1300,1500],sp:"arabica",va:"波旁、卡图艾",pr:"washed",ro:[3,4],fl:"坚果、香料、黑巧、土壤",lv:0,nt:"云雾林气候，全年多雨，干燥难度大"},
{n:"圣马可",en:"San Marcos",ct:"危地马拉",la:14.96,lo:-91.79,a:[1400,1800],sp:"arabica",va:"波旁、卡图艾",pr:"washed",ro:[3,4],fl:"柑橘、焦糖、花香",lv:0},
{n:"新东方",en:"Oriente / Chiquimula",ct:"危地马拉",la:14.80,lo:-89.55,a:[1200,1600],sp:"arabica",va:"波旁、卡图艾、Catimor",pr:"washed",ro:[3,4],fl:"黑巧、坚果、香料",lv:0},

{n:"恰帕斯",en:"Chiapas",ct:"墨西哥",la:16.73,lo:-92.64,a:[1200,1700],sp:"arabica",va:"铁皮卡、波旁、蒙多诺沃、卡杜拉",pr:"washed",ro:[3,4],fl:"坚果、黑巧、柑橘、柔和",lv:0,nt:"墨西哥产量最大产区，小农 + 合作社为主"},
{n:"韦拉克鲁斯",en:"Veracruz / Coatepec",ct:"墨西哥",la:19.45,lo:-96.96,a:[1000,1500],sp:"arabica",va:"铁皮卡、波旁、蒙多诺沃、Garnica",pr:"washed",ro:[3,4],fl:"坚果、黑巧、柑橘、香料",lv:0},
{n:"瓦哈卡",en:"Oaxaca / Pluma",ct:"墨西哥",la:15.92,lo:-96.43,a:[1000,1700],sp:"arabica",va:"铁皮卡、波旁、Pluma Hidalgo",pr:"washed",ro:[2,3],fl:"花香、柑橘、蜂蜜、轻盈",lv:0},

{n:"慧兰",en:"Huila",ct:"哥伦比亚",la:1.85,lo:-76.05,a:[1500,2000],sp:"arabica",va:"卡杜拉、Castillo、Colombia、粉红波旁、瑰夏",pr:"washed",ro:[2,3],fl:"柑橘、焦糖、核果、花香、均衡",lv:1,sub:[{"n":"皮塔利托","en":"Pitalito","t":"admin","a":[1500,1900],"pr":"washed","nt":"全国咖啡产量最大的市镇，处理厂与合作社最密集"},{"n":"圣阿古斯丁","en":"San Agustín","t":"admin","a":[1700,2000],"pr":"washed","nt":"高海拔市镇，厌氧与延长发酵实验最活跃的一带"},{"n":"拉普拉塔","en":"La Plata","t":"admin","a":[1500,1900],"pr":"washed","nt":"北部市镇，甜感与 body 更好"},{"n":"阿塞维多","en":"Acevedo","t":"admin","a":[1500,1800],"pr":"washed","nt":"南部市镇，近年精品批次增多"}],sn:"哥伦比亚以市镇（municipio）为最小流通单位，出口标签与竞赛批次通常写到市镇一级，庄园名常与市镇名连用。",nt:"厌氧发酵与延长发酵实验最活跃的产区（如 El Diviso、La Palma）"},
{n:"娜玲珑",en:"Nariño / Buesaco",ct:"哥伦比亚",la:1.20,lo:-77.30,a:[1800,2300],sp:"arabica",va:"卡杜拉、Castillo、Caturrón",pr:"washed",ro:[1,2],fl:"高海拔明亮酸、柑橘、花香、蜂蜜",lv:1,sub:[{"n":"布埃萨科","en":"Buesaco","t":"admin","a":[1900,2300],"pr":"washed","nt":"海拔最高的市镇之一，酸质最明亮，产区名的后半段即来自此"},{"n":"拉乌尼翁","en":"La Unión","t":"admin","a":[1800,2100],"pr":"washed","nt":"北部市镇，柑橘与花香调突出"},{"n":"拉佛罗里达","en":"La Florida","t":"admin","a":[1900,2200],"pr":"washed","nt":"高海拔市镇，甜感厚、酸质细"},{"n":"阿沃莱达","en":"Arboleda","t":"admin","a":[1900,2200],"pr":"washed","nt":"与 Buesaco 相邻的高海拔市镇，批次常与 Buesaco 混标"}],sn:"哥伦比亚以市镇（municipio）为最小流通单位，出口标签与竞赛批次通常写到市镇一级，庄园名常与市镇名连用。",nt:"哥伦比亚海拔最高产区，赤道附近，全年可采"},
{n:"考卡",en:"Cauca / Popayán",ct:"哥伦比亚",la:2.44,lo:-76.60,a:[1700,2100],sp:"arabica",va:"卡杜拉、Castillo、Colombia、粉红波旁",pr:"washed",ro:[2,3],fl:"柑橘、焦糖、黑巧、花香",lv:0,sub:[{"n":"因萨","en":"Inzá","t":"admin","a":[1700,2100],"pr":"washed","nt":"Cauca 东北部高海拔市镇，与 Tierradentro 相邻，酸质最明亮"},{"n":"廷比奥","en":"Timbío","t":"admin","a":[1600,1900],"pr":"washed","nt":"紧邻 Popayán，处理与出口便利，是 Cauca 的主要出货口"}],sn:"哥伦比亚以市镇（municipio）为最小流通单位，出口标签与竞赛批次通常写到市镇一级，庄园名常与市镇名连用。"},
{n:"托利马",en:"Tolima",ct:"哥伦比亚",la:4.44,lo:-75.23,a:[1500,2000],sp:"arabica",va:"卡杜拉、Castillo、Colombia",pr:"washed",ro:[2,3],fl:"柑橘、焦糖、花香",lv:0},
{n:"安蒂奥基亚",en:"Antioquia",ct:"哥伦比亚",la:6.24,lo:-75.58,a:[1300,1800],sp:"arabica",va:"卡杜拉、Castillo、Colombia",pr:"washed",ro:[3,4],fl:"坚果、黑巧、柑橘",lv:0},
{n:"桑坦德",en:"Santander",ct:"哥伦比亚",la:7.12,lo:-73.12,a:[1400,1900],sp:"arabica",va:"铁皮卡、波旁、卡杜拉、Castillo",pr:"washed",ro:[3,4],fl:"黑巧、坚果、柑橘、香料",lv:0},
{n:"卡尔达斯",en:"Caldas / Manizales",ct:"哥伦比亚",la:5.07,lo:-75.52,a:[1400,1900],sp:"arabica",va:"卡杜拉、Castillo、Colombia",pr:"washed",ro:[3,4],fl:"焦糖、柑橘、坚果",lv:0},

{n:"喜拉多",en:"Cerrado Mineiro",ct:"巴西",la:-18.94,lo:-46.99,a:[800,1250],sp:"arabica",va:"蒙多诺沃、卡图艾、Topazio、黄波旁、Acaiá",pr:"pulped",ro:[4,5],fl:"坚果、黑巧、焦糖、低酸、极醇厚",lv:1,sub:[{"n":"帕特罗西尼奥","en":"Patrocínio","t":"admin","a":[900,1250],"pr":"pulped","nt":"DO 核心市镇，大型机械化农场最集中"},{"n":"蒙特卡梅洛","en":"Monte Carmelo","t":"admin","a":[850,1150],"pr":"pulped","nt":"去果皮日晒（Pulped Natural）比例最高的市镇之一"},{"n":"帕托斯德米纳斯","en":"Patos de Minas","t":"admin","a":[800,1050],"pr":"pulped","nt":"DO 北部市镇，谷物与咖啡轮作，机械采收为主"},{"n":"阿拉瓜里","en":"Araguari","t":"admin","a":[850,1100],"pr":"pulped","nt":"西部市镇，地势平缓，适合大规模机械作业"}],sn:"Cerrado Mineiro 是巴西第一个获得正式原产地标识（Indicação de Procedência）的咖啡产区，内部以市镇划分，全境位于 Cerrado 稀树草原生物群系内、海拔 800–1300 m。",nt:"巴西第一个法定原产地（DO）；去果皮日晒（Pulped Natural）与机械干燥发源地"},
{n:"南米纳斯",en:"Sul de Minas",ct:"巴西",la:-21.55,lo:-45.43,a:[900,1300],sp:"arabica",va:"黄波旁、红波旁、卡图艾、蒙多诺沃",pr:"natural",ro:[4,5],fl:"坚果、焦糖、黑巧、奶油感",lv:1,sub:[{"n":"曼蒂凯拉·迪米纳斯","en":"Mantiqueira de Minas","t":"do","a":[950,1400],"pr":"natural","nt":"位于 Sul de Minas 内部的 IG 子产区（2011 年获 INPI 认可），涵盖 Carmo de Minas、São Lourenço 等市镇"},{"n":"卡尔莫·迪米纳斯","en":"Carmo de Minas","t":"admin","a":[1000,1300],"pr":"natural","nt":"Mantiqueira 内海拔较高、巴西 COE 冠军最集中的市镇"},{"n":"波苏斯迪卡尔达斯","en":"Poços de Caldas","t":"admin","a":[900,1300],"pr":"natural","nt":"火山口地貌，Sul de Minas 东翼的老牌产区"},{"n":"瓜舒佩","en":"Guaxupé","t":"admin","a":[850,1100],"pr":"natural","nt":"与 Mogiana 交界的市镇，合作社体系成熟，出口与拼配主力"}],sn:"Sul de Minas 是 Minas Gerais 南部的传统大区，内部还包含 Mantiqueira de Minas 等 IG 子产区；巴西精品咖啡的黄波旁多出自此。",nt:"巴西精品主力，黄波旁（Yellow Bourbon）代表"},
{n:"摩吉安纳",en:"Mogiana",ct:"巴西",la:-20.54,lo:-47.40,a:[900,1200],sp:"arabica",va:"蒙多诺沃、卡图艾、黄波旁",pr:"pulped",ro:[4,5],fl:"焦糖、坚果、黑巧",lv:0},
{n:"巴伊亚高原",en:"Planalto da Bahia",ct:"巴西",la:-14.85,lo:-40.84,a:[900,1200],sp:"arabica",va:"卡图艾、蒙多诺沃、Catucaí",pr:"natural",ro:[4,5],fl:"坚果、黑巧、柑橘、香料",lv:0},
{n:"圣埃斯皮里图",en:"Espírito Santo（Conilon）",ct:"巴西",la:-19.50,lo:-40.50,a:[200,800],sp:"robusta",va:"科尼隆 Conilon（罗布斯塔变种）",pr:"natural",ro:[5,5],fl:"苦、木质、谷物、烟熏",lv:0,nt:"巴西罗布斯塔主产区，供速溶与拼配"},
{n:"卡哈马卡",en:"Cajamarca",ct:"秘鲁",la:-7.16,lo:-78.51,a:[1500,2000],sp:"arabica",va:"铁皮卡、波旁、卡杜拉、Pache",pr:"washed",ro:[3,4],fl:"坚果、焦糖、柔和柑橘、干净",lv:1,sub:[{"n":"圣伊格纳西奥","en":"San Ignacio","t":"admin","a":[1500,1900],"pr":"washed","nt":"北部与厄瓜多尔接壤的省，有机与公平贸易认证最集中"},{"n":"哈恩","en":"Jaén","t":"admin","a":[1500,1900],"pr":"washed","nt":"同属北部走廊，海拔与酸质相近"},{"n":"乔塔","en":"Chota","t":"admin","a":[1500,2000],"pr":"washed","nt":"以女性生产者项目（Café Femenino）闻名的地区"}],nt:"全球有机与公平贸易认证比例最高的产区之一"},
{n:"库斯科",en:"Cusco / La Convención",ct:"秘鲁",la:-12.90,lo:-72.60,a:[1200,1900],sp:"arabica",va:"铁皮卡、波旁、卡杜拉",pr:"washed",ro:[2,3],fl:"柑橘、焦糖、花香、蜂蜜",lv:0},
{n:"圣马丁",en:"San Martín",ct:"秘鲁",la:-6.03,lo:-76.97,a:[900,1400],sp:"arabica",va:"卡蒂姆、铁皮卡、波旁",pr:"washed",ro:[3,4],fl:"坚果、黑巧、柔和酸",lv:0},
{n:"永加斯",en:"Yungas / Caranavi",ct:"玻利维亚",la:-15.83,lo:-67.57,a:[1500,2000],sp:"arabica",va:"铁皮卡、卡杜拉、卡图艾",pr:"washed",ro:[3,4],fl:"黑巧、坚果、柑橘、蜂蜜、干净",lv:1,nt:"安第斯东坡陡坡有机小农，海拔最高的商业产区之一"},
{n:"洛哈",en:"Loja / Vilcabamba",ct:"厄瓜多尔",la:-4.00,lo:-79.20,a:[1400,1900],sp:"arabica",va:"铁皮卡、波旁、卡杜拉",pr:"washed",ro:[2,3],fl:"花香、柑橘、焦糖、红茶",lv:0},
{n:"加拉帕戈斯",en:"Galápagos / San Cristóbal",ct:"厄瓜多尔",la:-0.90,lo:-89.40,a:[200,400],sp:"arabica",va:"波旁 Bourbon",pr:"washed",ro:[3,4],fl:"柑橘、饼干、柔和、干净",lv:0,nt:"赤道上的极罕见低海拔商业产区，靠洋流与云雾降温"},
{n:"梅里达",en:"Mérida",ct:"委内瑞拉",la:8.60,lo:-71.15,a:[1200,1800],sp:"arabica",va:"铁皮卡、波旁、卡杜拉",pr:"washed",ro:[3,4],fl:"坚果、黑巧、柔和柑橘",lv:0},
];

/* 处理法字典 */
const PROCESS = {
  washed:   {k:"水洗",       c:"#3fb6d8", d:"去果皮果肉后入水槽发酵去胶，再清洗干燥。酸质干净、层次清晰。"},
  natural:  {k:"日晒",       c:"#e8943a", d:"整果带果肉直接晾晒，发酵参与度高。body 厚、果香酒香强。"},
  honey:    {k:"蜜处理",     c:"#f2c14e", d:"去果皮保留部分果胶干燥。甜感与 body 介于水洗与日晒之间。"},
  wethulled:{k:"湿刨",       c:"#8a5a35", d:"印尼 Giling Basah：含水率 30–50% 即脱壳干燥。低酸、草本木质。"},
  pulped:   {k:"半日晒",     c:"#c2673e", d:"巴西 Pulped Natural / Cereja Descascado：去果皮带果胶日晒。"},
  special:  {k:"特殊处理",   c:"#a06fd0", d:"季风仓储、厌氧发酵、碳酸浸渍等非主流工艺。"},
};

/* 豆种大类字典 */
const SPECIES = {
  arabica: {k:"阿拉比卡", s:"circle", d:"Coffea arabica，占全球产量约 6 成，风味复杂度高，需高海拔。"},
  robusta: {k:"罗布斯塔", s:"diamond", d:"Coffea canephora，低海拔、抗病、咖啡因约为阿拉比卡 2 倍。"},
  both:    {k:"阿/罗兼产", s:"ring",   d:"同一产区内阿拉比卡与罗布斯塔并存。"},
};

/* 子产区「单元类型」字典 —— 各国层级不对等，必须先看清这一格再横向比较 */
const SUBTYPE = {
  admin:   {k:"行政区",   d:"woreda / 市镇 / 县 / 教区 / 区等正式行政区划单元"},
  station: {k:"处理站",   d:"水洗站 / 干燥站 / 合作社，收购周边小农的咖啡樱桃统一处理"},
  estate:  {k:"庄园",     d:"单一农场（Finca / Fazenda / Estate），自有地块与处理设施"},
  hill:    {k:"地块",     d:"庄园内部或村域内的微地块（Lot / 山头 / 村），常以「庄园＋地块」流通"},
  do:      {k:"法定产区", d:"受法律或地理标识保护的产区单元（DO / IG / Appellation）"},
};

/* 烘焙度字典（注意：烘焙度非产区属性，为常见选择区间） */
const ROAST = [
  {k:"浅焙",   d:"一爆后即出，酸质与产地风味最突出（Agtron 约 70+）"},
  {k:"中浅焙", d:"一爆密集结束前后，酸甜平衡，花香果香清晰"},
  {k:"中焙",   d:"一爆结束至二爆前，甜感与焦糖化明显"},
  {k:"中深焙", d:"接近二爆，body 增厚，酸度收敛"},
  {k:"深焙",   d:"二爆后，焦糖化与苦味主导，产地特征弱化"},
];
