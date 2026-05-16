// ===== 南大受苦模拟器 - 数据文件 =====

const allCards = [
    // ===== 初始牌 =====
    {id:"init_study", name:"学习", cost:1, type:"study", damage:6, defense:0, gpa:1, image:"images/卡牌-学业/1.png", desc:"造成6点伤害。"},
    {id:"init_phone", name:"小手机真好玩", cost:1, type:"fun", damage:0, defense:5, gpa:0, image:"images/卡牌-娱乐/摸小蓝鲸.png", desc:"获得5点效率。"},
    // ===== 学业牌 =====
    {id:"s1", name:"量子速读", cost:1, type:"study", damage:5, defense:0, gpa:3, image:"images/卡牌-学业/2.png", effect:"draw1", desc:"造成5点伤害。抽1张牌。"},
    {id:"s2", name:"考试周", cost:3, type:"study", damage:24, defense:0, gpa:5, image:"images/卡牌-学业/3.png", effect:"nextTurnEnergy-1", desc:"造成24点伤害。下回合精力-1。"},
    {id:"s3", name:"记笔记", cost:1, type:"study", damage:0, defense:0, gpa:3, image:"images/卡牌-学业/4.png", effect:"studyDamage+2", desc:"获得2点专注（学业牌伤害+2，本场战斗）。"},
    {id:"s4", name:"图书馆通宵", cost:2, type:"study", damage:14, defense:0, gpa:5, image:"images/卡牌-学业/图书馆通宵.png", effect:"selfDamage3", desc:"造成14点伤害。自身-3心态。"},
    {id:"s5", name:"提问", cost:1, type:"study", damage:7, defense:0, gpa:3, image:"images/卡牌-学业/5.png", effect:"reduceEnemyDamage3", desc:"造成7点伤害。敌人本回合伤害-3。"},
    {id:"s6", name:"蹭课大佬", cost:1, type:"study", damage:8, defense:0, gpa:2, image:"images/卡牌-学业/6.png", effect:"discoverOtherType", desc:"造成8点伤害。发现一张其他流派牌。"},
    {id:"s7", name:"聚精会神", cost:1, type:"study", damage:0, defense:8, gpa:2, image:"images/卡牌-学业/7.png", desc:"获得8点效率。"},
    {id:"s8", name:"学术引用", cost:1, type:"study", damage:0, defense:0, gpa:2, image:"images/卡牌-学业/8.png", effect:"copyLastStudyHalf", desc:"复制上张学业牌效果(伤害减半)。"},
    {id:"s9", name:"咖啡", cost:0, type:"study", damage:0, defense:0, gpa:0, image:"images/卡牌-学业/9.png", effect:"gainEnergy1,selfDamage8", desc:"获得1精力。-8心态。"},
    {id:"s10", name:"答辩", cost:2, type:"study", damage:22, defense:0, gpa:8, image:"images/卡牌-学业/10.png", effect:"healOnKill5", desc:"造成22点伤害。若击败敌人，心态回5。"},
    // ===== 娱乐牌 =====
    {id:"f1", name:"摸小蓝鲸", cost:0, type:"fun", damage:0, defense:4, gpa:0, image:"images/卡牌-娱乐/摸小蓝鲸.png", effect:"noDamageThisTurn", desc:"获得4点效率。本回合无法造成伤害。"},
    {id:"f2", name:"犒劳自己", cost:0, type:"fun", damage:0, defense:0, gpa:0, moneyCost:25, effect:"heal12,allDamage+2", desc:"花25生活费。+12心态，本回合伤害+2。"},
    {id:"f3", name:"重新开始？", cost:1, type:"fun", damage:0, defense:0, gpa:0, effect:"discardAllRedrawEqual,heal2", desc:"弃所有手牌重抽等量。+2心态。"},
    {id:"f4", name:"堵桥来", cost:2, type:"fun", damage:10, defense:0, gpa:0, effect:"heal2,drawSocial", desc:"造成10伤害，+2心态，抽1张社交牌。"},
    {id:"f5", name:"网购", cost:0, type:"fun", damage:0, defense:0, gpa:0, moneyCost:15, effect:"randomTempItem", desc:"花15生活费。随机获得临时道具。"},
    {id:"f6", name:"校园墙对线", cost:1, type:"fun", damage:0, defense:0, gpa:0, effect:"weakEnemy", desc:"敌人下回合伤害降低50%。"},
    {id:"f7", name:"卧谈", cost:1, type:"fun", damage:0, defense:0, gpa:0, image:"images/卡牌-娱乐/卧谈.png", effect:"draw2,socialCost-1", desc:"抽2张牌。社交牌消耗-1。"},
    {id:"f8", name:"下周再说", cost:0, type:"fun", damage:0, defense:0, gpa:0, effect:"gainEnergy1,addAnxiety", desc:"获得1精力。牌组加1张焦虑。"},
    {id:"f9", name:"白日梦", cost:1, type:"fun", damage:0, defense:15, gpa:0, effect:"loseDefense5NextTurn", desc:"获得15点效率。下回合-5效率。"},
    {id:"f10", name:"说走就走的旅行", cost:0, type:"fun", damage:0, defense:0, gpa:-15, moneyCost:50, effect:"endBattle,fullHeal", desc:"花50生活费。结束战斗，心态回满。代价：扣15学分。"},
    // ===== 社交牌 =====
    {id:"so1", name:"菜菜捞捞", cost:1, type:"social", damage:0, defense:0, gpa:0, effect:"surviveLethalWith1hp", desc:"下次致死伤害保留1心态。"},
    {id:"so3", name:"义父！", cost:0, type:"social", damage:0, defense:0, gpa:0, moneyCost:20, effect:"gainEnergy1", desc:"花20生活费。+1精力。"},
    {id:"so4", name:"聚餐", cost:0, type:"social", damage:0, defense:0, gpa:0, moneyCost:25, effect:"next2SocialFree", desc:"花25生活费。下2张社交牌免费。"},
    {id:"so5", name:"代签", cost:0, type:"social", damage:10, defense:0, gpa:0, hidden:"noGpaThisBattle", desc:"造成10点伤害。"},
    {id:"so6", name:"我需要朋导！", cost:1, type:"social", damage:0, defense:0, gpa:1, image:"images/卡牌-社交/朋导.png", effect:"addStudyCard0Cost", desc:"随机学业牌加入手牌(本回合0耗)。"},
    {id:"so7", name:"社团团建", cost:2, type:"social", damage:0, defense:0, gpa:-2, effect:"allCards+3permanent", desc:"所有手牌伤害/防御+3(本战斗)。"},
    // ===== 诅咒牌 =====
    {id:"c1", name:"过敏性鼻炎", cost:-1, type:"curse", damage:0, defense:0, gpa:0, effect:"retain,firstCardCost+1Conditional", desc:"[保留]在手中时，每3回合让第一张牌精力消耗+1。"},
    {id:"c2", name:"帝王蟹（已废弃）", cost:-1, type:"curse", damage:0, defense:0, gpa:0, effect:"every2TurnsEnergy-1", desc:"[已废弃]此卡牌不应出现。"},
    {id:"c3", name:"昏昏欲睡", cost:-1, type:"curse", damage:0, defense:0, gpa:0, effect:"occupyHandSlot", desc:"占据手牌位，无任何作用。"},
    {id:"c4", name:"焦虑", cost:1, type:"curse", damage:0, defense:0, gpa:0, effect:"exhaust", desc:"[消耗]打出后移除。无正面效果。"}
];

// 初始牌组
const initialDeck = [
    "init_study", "init_study", "init_study", "init_study",
    "init_phone", "init_phone", "init_phone", "init_phone",
    "s1", "so3"
];

// 怪物数据
const enemies = {
    ddl: {
        name: "DDL",
        hp: 60,
        image: "images/怪物_小DDL.png",
        isElite: false,
        isBoss: false,
        reward: {money: 50, cardChoice: 1},
        pattern: [
            {turn:1, intent:"还有3天", damage:6, effect:"addAnxietyToDraw1", desc:"造成6伤害。抽牌堆+1焦虑。"},
            {turn:2, intent:"还有2天", damage:0, defense:12, effect:"addAnxietyToDiscard2", desc:"获得12效率。弃牌堆+2焦虑。"},
            {turn:3, intent:"明天交！", damage:14, effect:"addAnxietyToHand1", desc:"造成14伤害。手牌+1焦虑。"},
            {turn:4, intent:"死线降临", damage:20, effect:"gpa-0.3", desc:"造成20伤害，GPA-0.3。"},
            {turn:5, intent:"延期/补交", damage:0, effect:"loop", desc:"不行动。重新循环。"}
        ]
    },
    teacher: {
        name: "点名的老师",
        hp: 50,
        image: "images/怪物_点名老师.png",
        isElite: false,
        isBoss: false,
        reward: {money: 50, cardChoice: 1},
        pattern: [
            {turn:1, intent:"后排玩手机的收起来！", damage:8, effect:"banFunNextTurn", desc:"造成8伤害。下回合禁用娱乐牌。"},
            {turn:2, intent:"不要交头接耳！", damage:0, defense:12, effect:"banSocialNextTurn", desc:"获得12效率。下回合禁用社交牌。"},
            {turn:3, intent:"这道题谁来做？", damage:16, desc:"造成16伤害。"},
            {turn:4, intent:"纪律太差了，全体自习！", damage:6, effect:"banFunAndSocialNextTurn", desc:"造成6伤害。下回合禁用娱乐和社交牌。"},
            {turn:5, intent:"喝口水润润嗓", damage:0, effect:"loop", desc:"休息。重新循环。"}
        ]
    },
    run24: {
        name: "2.4km体测",
        hp: 60,
        image: "images/怪物_2400.png",
        isElite: true,
        isBoss: false,
        reward: {money: 80, cardChoice: 2, relic: 1},
        phase1: [
            {turn:1, intent:"起跑的错觉", damage:0, effect:"playerMaxEnergy-1NextTurn", desc:"不造成伤害。下回合精力-1。"},
            {turn:2, intent:"岔气与腹痛", damage:8, effect:"maxCards2ThisTurn", desc:"造成8伤害。本回合最多出2张牌。"},
            {turn:3, intent:"步伐沉重", damage:12, effect:"defenseHalfNextTurn", desc:"造成12伤害。下回合效率获取减半。"},
            {turn:4, intent:"口干舌燥", damage:10, effect:"discardRandomFunOrSocial", desc:"造成10伤害。随机弃1张娱乐/社交牌。"},
            {turn:5, intent:"循环", damage:0, effect:"gotoPhase1Turn2", desc:"回到第2回合。"}
        ],
        phase2: [
            {intent:"最后400米！", damage:18, effect:"ignoreWeak,repeat", desc:"每回合18伤害，无视虚弱。"}
        ]
    },
    finalWeek: {
        name: "期！末！周！",
        hp: 130,
        image: "images/怪物_期末周.png",
        isElite: false,
        isBoss: true,
        reward: {money: 100, gpa: 0.5},
        pattern: [
            {turn:1, intent:"发布考试安排表", damage:0, defense:8, effect:"summonMiniDDL2", desc:"召唤2只小DDL。获得8效率。"},
            {turn:2, intent:"考前划重点", damage:8, effect:"addAnxiety2", desc:"造成8伤害。+2焦虑到抽牌堆。"},
            {turn:3, intent:"图书馆抢座失败", damage:12, effect:"playerMaxEnergy-1NextTurn", desc:"造成12伤害。下回合精力上限-1。"},
            {turn:4, intent:"通宵的后遗症", damage:0, defense:15, desc:"不行动。获得15点效率。"},
            {turn:5, intent:"循环重置", damage:0, effect:"loop", desc:"重新循环。"}
        ]
    },
    miniDDL: {
        name: "夺命小DDL",
        hp: 18,
        image: "images/怪物_小DDL.png",
        isSummon: true,
        pattern: [
            {turn:1, intent:"倒数3", damage:0, desc:"无动作。"},
            {turn:2, intent:"倒数2", damage:4, desc:"造成4伤害。"},
            {turn:3, intent:"死线爆炸", damage:10, effect:"gpa-0.1,selfDestruct", desc:"造成10伤害，GPA-0.1，自毁。"}
        ]
    }
};

// 事件数据
const events = {
    library: {
        name: "深夜图书馆",
        image: "images/深夜图书馆_选择界面.jpg",
        desc: "晚上十点半，闭馆音乐即将响起。四周只有翻书的沙沙声。在这个神圣的「卷王」殿堂里，看着周围奋笔疾书的同学，你感觉必须做出一些抉择。",
        choices: [
            {text:"再看一页，就看一页…", subtitle:"（沉浸式钻研）",
                resultImage: "images/深夜图书馆_选牌.jpg",
                result:"知识以一种极其痛苦的方式进入了你的大脑，你感觉自己变强了，但也快猝死了。",
                effect:"hp-5,chooseStudyCard", effectDesc:"失去5心态，获得1张学业牌（三选一）。"},
            {text:"娱乐是可耻的。", subtitle:"（清理桌面）",
                resultImage: "images/深夜图书馆_删牌.jpg",
                result:"看着周围努力的人们，你感到一丝羞愧。你果断卸载了手机里的摸鱼软件，感觉灵魂得到了升华。",
                effect:"removeFunCard", effectDesc:"永久移除牌组中的1张娱乐牌。"}
        ]
    },
    beidalou: {
        name: "百年北大楼",
        image: "images/百年北大楼事件_选择界面.jpg",
        desc: "夕阳洒在爬满青藤的红砖老楼上。微风不燥，你仿佛听到了百年来无数学子在这里翻书的回音。这是母校的精神图腾。",
        choices: [
            {text:"买个文创雪糕，发个朋友圈！", subtitle:"（常春藤下合影）",
                resultImage: "images/百年北大楼选择_文创雪糕.jpg",
                result:"点赞数蹭蹭上涨！虽然花了一点小钱，但你收获了满满的情绪价值和新的人脉。",
                effect:"money-10,hp+15,addSocialCard", effectDesc:"消耗10生活费。回复15心态，获得1张社交牌。"},
            {text:"老师，我好像有点迷茫……", subtitle:"（偶遇辅导员谈心）",
                resultImage: "images/百年北大楼事件_辅导员.jpg",
                result:"辅导员一针见血地指出了你的问题。虽然过程让人压力山大，但你成功解开了心结。",
                effect:"hp-5,removeCurse,gpa+0.5", effectDesc:"失去5心态。永久移除1张废牌/诅咒牌，隐藏GPA+0.5。"},
            {text:"触摸红砖，感受先辈的智慧", subtitle:"（感悟百年传承）",
                resultImage: "images/百年北大楼事件_触摸红砖.jpg",
                result:"在这一刻，你如同被打通了任督二脉，某项复杂的知识深深印入了脑海，化作了本能。",
                effect:"addInnateToStudyCard", effectDesc:"选择1张学业牌，赋予[固有]属性（开局必在手牌）。"}
        ]
    },
    canteen: {
        name: "干饭的抉择",
        image: "images/干饭的抉择事件_选择界面.jpg",
        desc: "下课铃响，你思考着午饭吃什么。",
        choices: [
            {text:"相信师傅！支持改进！", subtitle:"（10生活费）", cost:10, isGamble:true,
                success:{chance:50, resultImage:"images/干饭的抉择事件_食堂_好.jpg", result:"师傅今天超常发挥！这份黄焖鸡不仅肉多，还治愈了你的灵魂。", effect:"hp+25,gpa+0.2"},
                fail:{chance:50, resultImage:"images/干饭的抉择选择_食堂_坏.jpg", result:"这如出一辙的绝望味道……你看着盘子里难以名状的糊状物，瞬间失去了活下去的动力。", effect:"hp-15,addSick"}
            },
            {text:"前往广州路「第二食堂」", subtitle:"（50生活费）", cost:50,
                resultImage: "images/干饭的抉择_麦当劳.jpg",
                result:"听着若有若无的「Ba-da-ba-ba-ba」提示音，你感受到了工业流水线带来的极致稳定。M门的庇护让你瞬间回血！",
                effect:"fullHeal,randomRelic", effectDesc:"心态回满，获得1件随机生活用品。"}
        ]
    },
    supermarket: {
        name: "校园超市",
        image: "images/校园超市_选择界面.jpg",
        desc: "你走进了灯火通明的校园超商。货架上堆满物美价廉的东西。",
        choices: [
            {text:"小买一点", subtitle:"（30生活费）", cost:30,
                result:"饮料和零食是人类之光。",
                effect:"hp+20", effectDesc:"+20心态。"},
            {text:"大买特买", subtitle:"（80生活费）", cost:80,
                result:"一分钱一分货，希望这玩意能在期末救我一命。",
                effect:"chooseItem", effectDesc:"选择道具购买。"},
            {text:"回收垃圾", subtitle:"（40生活费）", cost:40,
                result:"断舍离才是大学的必修课。",
                effect:"removeAnyCard", effectDesc:"永久移除1张牌。"}
        ]
    }
};

// 随机事件
const randomEvents = {
    lecture: {
        name: "学术讲座",
        image: "images/学术讲座_选择界面.jpg",
        desc: "辅导员在群里发了强制通知：「今晚大礼堂有讲座，所有人必须打卡签到！」你拖着疲惫的身躯走进了大厅。",
        choices: [
            {text:"硬着头皮听讲", subtitle:"（系统自动判定）", isGamble:true,
                success:{chance:50, resultImage:"images/学术讲座_好.jpg", result:"竟然是干货满满的讲座！大牛的分享让你茅塞顿开。", effect:"gpa+1.0,maxHp+10"},
                fail:{chance:50, resultImage:"images/学术讲座_失.jpg", result:"台上照本宣科，台下灵魂枯萎。你如同坐牢一般熬过了这两个小时，满脑子都是浆糊。", effect:"hp-10,addSleepy"}
            }
        ]
    },
    nobel: {
        name: "诺奖得主开讲啦",
        image: "images/诺奖事件_选择界面.jpg",
        desc: "轰动全校！诺奖得主竟然来开讲座了！报告厅外挤满了人，过道里连落脚的地方都没有。",
        choices: [
            {text:"挤进前排聆听", subtitle:"（系统检测当前心态值）", isConditional:true,
                conditions:[
                    {check:"hp >= 35", result:"你与大师产生了灵魂共振！你不仅听懂了核心理论，甚至还在结束后要到了签名！", effect:"addNobelRelic"},
                    {check:"hp < 35", result:"你太累了……你只觉得不明觉厉，随后在一片高深莫测的理论中沉沉睡去。", effect:"nothing"}
                ]
            }
        ]
    },
    allergy: {
        name: "会呼吸的痛",
        image: "images/会呼吸的痛事件_选择界面.jpg",
        desc: "谷雨刚过，校园里漫天飞舞着柳絮和梧桐毛。空气中全是这种白色的小炸弹，你感觉鼻子发痒，呼吸开始变得困难。",
        choices: [
            {text:"在书包里翻找口罩", subtitle:"（系统检测卡组厚度）", isConditional:true,
                conditions:[
                    {check:"deckSize <= 10", resultImage:"images/会呼吸的痛_成功.png", result:"幸好轻装上阵！你迅速从整洁的包里摸出了备用口罩，逃过一劫。", effect:"hp-3"},
                    {check:"deckSize > 10", resultImage:"images/会呼吸的痛_失败.jpg", result:"东西实在太多了！等你在那堆乱七八糟的课本和杂物里翻出口罩时，过敏性鼻炎已经彻底爆发了！", effect:"hp-10,addRhinitis"}
                ]
            }
        ]
    },
    crabEvent: {
        name: "好事之人",
        image: "images/好事之人事件_选择界面.jpg",
        desc: "手机狂震，母校因一张「999元帝王蟹」的照片被全网围攻。营销号和键盘侠高举「正义」大旗，评论区里各种断章取义。作为深爱母校的校友，你感到极其愤怒。",
        choices: [
            {text:"陷入舆论的漩涡", subtitle:"",
                resultImage: "images/好事之人事件_结算画面.png",
                result:"无论你怎么辩解，声音都瞬间被流量淹没，让你心力交瘁。",
                effect:"addCrabRelic", effectDesc:"获得负面生活用品「帝王蟹」（每3回合精力-1）。"}
        ]
    },
    mysteryMan: {
        name: "鼓楼校口的神秘人",
        image: "images/神秘的人演讲哥事件_选择界面.jpg",
        desc: "在汉口路校门口，那个人又出现了！他正对着空气高谈阔论着一些常人难以理解的言论。",
        choices: [
            {text:"试图理解他的逻辑", subtitle:"", isGamble:true,
                success:{chance:50, resultImage:"images/神秘人事件_选项.jpg", result:"你悟了！你从乱码般的话语中捕捉到了降维打击的思维方式！", effect:"addPhilosophyRelic"},
                fail:{chance:50, resultImage:"images/神秘人事件_选项1.jpg", result:"CPU烧了…试图解析毫无逻辑的词汇让你精神几近崩溃。", effect:"hp-15"}
            },
            {text:"买瓶饮料递给他", subtitle:"（10生活费）", cost:10,
                result:"无论真理如何，你选择保留一丝人文关怀。这让你觉得自己依然是个有温度的人。",
                effect:"hp+15,addSocialCard", effectDesc:"消耗10生活费，+15心态，获1张社交牌。"},
            {text:"快步避开，默念不延毕", subtitle:"",
                result:"他的现状是你最大的警示！你心中警钟长鸣，瞬间充满了对学业的敬畏。",
                effect:"gpa+0.5", effectDesc:"隐藏GPA+0.5。"}
        ]
    },
    niuniu: {
        name: "神秘的牛牛",
        isHidden: true,
        image: "images/牛牛事件_选择界面.jpg",
        desc: "你在学校里碰到了一位神秘的人。他递给你一根干瘪的菜根，缓缓问道：「同学，觉得读书苦吗？」",
        choices: [
            {text:"苦，但能熬。", subtitle:"",
                resultImage: "images/牛牛事件_菜根.jpg",
                result:"他欣慰地点点头：「嚼得菜根，做得大事。去吧，孩子。」",
                effect:"addCaigenRelic", effectDesc:"获得传奇生活用品【嚼过的菜根】（半血以下化身战神）。"},
            {text:"太特么苦了，我想回家。", subtitle:"",
                resultImage: "images/牛牛事件_生活费.jpg",
                result:"他叹了口气，往你手里塞了一把零钱：「去买点好吃的吧，别难为自己。」",
                effect:"money+50,gpa-0.5", effectDesc:"获得50生活费，但隐藏GPA-0.5。"}
        ]
    }
};

// 随机事件池
const randomEventPool = ["lecture", "nobel", "allergy", "crabEvent", "mysteryMan", "niuniu"];

// 遗物数据
const relics = {
    // 传奇
    nobel: {name:"诺奖得主的签名", type:"legendary", image:"images/遗物_诺奖得主的签名.png", effect:"每打出2张牌，下张学业牌消耗-1。", flavor:"大脑被开光了。"},
    caigen: {name:"嚼过的菜根", type:"legendary", image:"", effect:"心态<50%时，精力+1，学业牌伤害+3。", flavor:"嚼得菜根，做得大事。"},
    philosophy: {name:"哲学碎片", type:"legendary", image:"images/遗物_哲学碎片.png", effect:"一回合打出3张牌，随机1张牌消耗变0。", flavor:"降维打击。"},
    // 普通
    thermos: {name:"保温杯", type:"common", image:"images/遗物_保温杯.png", effect:"战斗开始获得6点效率。", flavor:"里面装的不是水，是我的生命。"},
    highlighter: {name:"四色荧光笔", type:"common", image:"images/遗物_四色笔.png", effect:"每场首张学业牌伤害+50%。", flavor:"划重点是有用的。"},
    headphones: {name:"降噪耳机", type:"common", image:"images/遗物_降噪耳机.png", effect:"战斗第一回合多抽1张牌。", flavor:"世界的喧嚣与我无关。"},
    redbull: {name:"瑞星？", type:"common", image:"images/遗物_瑞幸.png", effect:"精力上限+1，心态上限-10。", flavor:"烧血？"},
    // 负面
    crab: {name:"帝王蟹", type:"cursed", image:"", effect:"每场战斗第3、6、9...回合开始时，本回合精力-1。", flavor:"舆论的漩涡阴魂不散。"}
};

// 消耗道具
const items = {
    coffee: {name:"高浓度速溶咖啡", image:"images/道具_浓缩咖啡.png", effect:"立即+1精力。", flavor:"我还能蒸！"},
    paper: {name:"学霸的草稿纸", image:"images/道具_学霸的草稿纸.png", effect:"下张学业牌伤害翻倍。", flavor:"通往及格线的地图。"},
    cola: {name:"考试周快乐水", image:"images/道具_期末周快乐水.png", effect:"立即+15心态。", flavor:"二氧化碳的快乐是永恒的。"}
};

// 12周流程
const weekSchedule = [
    {week:12, name:"开学第一课", type:"fixed", event:"battle:ddl"},
    {week:11, name:"校园风波", type:"random"},
    {week:10, name:"初次花钱", type:"choice", options:["canteen","supermarket"]},
    {week:9, name:"大师与风暴", type:"random"},
    {week:8, name:"期中考试周", type:"fixed", event:"battle:teacher"},
    {week:7, name:"期中后休整", type:"choice", options:["beidalou","library"]},
    {week:6, name:"鼓楼的妖风", type:"random"},
    {week:5, name:"考前补给", type:"choice", options:["canteen","supermarket"]},
    {week:4, name:"体测噩梦季", type:"fixed", event:"battle:run24"},
    {week:3, name:"最后的抉择", type:"random"},
    {week:2, name:"终极打磨", type:"choice", options:["beidalou","library"]},
    {week:1, name:"战前补给", type:"choice", options:["canteen","supermarket"]},
    {week:0, name:"决战降临", type:"fixed", event:"battle:finalWeek"}
];

// 结局
const endings = {
    mentalBreak: {condition:"hp <= 0", rank:"F", title:"心态崩了：南大把你害惨了", desc:"压力、流言、鼻炎和无穷无尽的DDL彻底压垮了你。"},
    expelled: {condition:"gpa < 2.0", rank:"F", title:"学术终点：退学通知书", desc:"最终，你没能逃过教务处的邮件。从「一级预警」到「二级预警」，你终究在学术的荒原里迷了路。退学通知书上的校徽依然庄重，但你的南大故事在此画上了句号。"},
    S: {condition:"gpa >= 4.8", rank:"S", title:"南大之光：保研公示名单首位", desc:"查分系统的页面被你刷爆了。不仅「期末周」被你彻底征服，你的绩点更是达到了人类极限。辅导员笑眯眯地拿着保研推荐表走向你。你看着鼓楼的红砖，深藏功与名。"},
    A: {condition:"gpa >= 4.5", rank:"A", title:"绩点战神：仙林卷王", desc:"虽然没有达到顶尖的5.0，但你依然是仙林校区传说级的存在。在这个「期末周」的战场上，你精准地收割了每一分。你的名字将随着那份4.5+的成绩单在表白墙上流传。"},
    B: {condition:"gpa >= 3.5", rank:"B", title:"及格万岁：平凡的南大人", desc:"没有预警，没有挂科，你稳稳地落在了安全区。你长舒一口气，走出考场的那一刻，感觉九食堂的空气都变甜了。南大虽然把你「害惨了」，但你依然顽强地生存了下来。"},
    C: {condition:"gpa >= 2.0", rank:"C", title:"极限求生：广州路的远望", desc:"你带着「学业二级预警」的阴影，勉强完成了最后的冲刺。虽然GPA看着有些惊心动魄，但你终究还是留在了南大。你看着广州路的夕阳，暗暗发誓下学期一定多去几次图书馆。"}
};
