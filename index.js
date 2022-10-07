var M_WIDTH=800, M_HEIGHT=450;
var app, game_res, game, objects = {}, LANG = 0, state="", game_tick = 0, game_id = 0, connected = 1, client_id =0, h_state = 0, game_platform = "",
hidden_state_start = 0,room_name = 'states', pending_player = '', opponent = {}, my_data={opp_id : ''},
opp_data={}, some_process = {}, git_src = '', ME = 0, OPP = 1, WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2, my_turn = 1, skl_prepare, skl_throw, skl_lose, drag = 0, obj_to_follow = null, my_player = null, opp_player = null, cont_inv = 1;

var col_data=[['head','spine',[[-11,-19],[-1,-25],[9,-21],[12,-12],[9,-4],[0,0]]],['spine','spine',[[-1,-3],[0,29]]],['left_leg1','left_leg1',[[-14,-1],[16,-1]]],['left_leg2','left_leg2',[[-13,-3],[14,-3]]],['right_leg1','right_leg1',[[-14,-1],[16,-1]]],['right_leg2','right_leg2',[[13,2],[-13,2]]],['left_arm1','left_arm1',[[14,0],[-13,0]]],['left_arm2','left_arm2',[[-12,-1],[14,-1]]],['right_arm1','right_arm1',[[-15,0],[12,0]]],['right_arm2','right_arm2',[[-14,0],[12,0]]]];

var map_col_data=[];

irnd = function(min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

rnd2= function(min,max) {	
	let r=Math.random() * (max - min) + min
	return Math.round(r * 100) / 100
};

class player_mini_card_class extends PIXI.Container {

	constructor(x,y,id) {
		super();
		this.visible=false;
		this.id=id;
		this.uid=0;
		this.type = "single";
		this.x=x;
		this.y=y;
		this.bcg=new PIXI.Sprite(game_res.resources.mini_player_card.texture);
		this.bcg.interactive=true;
		this.bcg.buttonMode=true;
		this.bcg.pointerdown=function(){cards_menu.card_down(id)};
		this.bcg.pointerover=function(){this.bcg.alpha=0.5;}.bind(this);
		this.bcg.pointerout=function(){this.bcg.alpha=1;}.bind(this);
		this.bcg.width=200;
		this.bcg.height=100;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=20;
		this.avatar.y=20;
		this.avatar.width=this.avatar.height=60;

		this.name="";
		this.name_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 20,align: 'center'});
		this.name_text.anchor.set(0.5,0.5);
		this.name_text.x=135;
		this.name_text.y=35;

		this.rating=0;
		this.rating_text=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 24,align: 'center'});
		this.rating_text.tint=0xffff00;
		this.rating_text.anchor.set(0.5,0.5);
		this.rating_text.x=135;
		this.rating_text.y=70;

		//аватар первого игрока
		this.avatar1=new PIXI.Sprite();
		this.avatar1.x=20;
		this.avatar1.y=20;
		this.avatar1.width=this.avatar1.height=60;

		//аватар второго игрока
		this.avatar2=new PIXI.Sprite();
		this.avatar2.x=120;
		this.avatar2.y=20;
		this.avatar2.width=this.avatar2.height=60;

		this.rating_text1=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 18,align: 'center'});
		this.rating_text1.tint=0xffff00;
		this.rating_text1.anchor.set(0.5,0);
		this.rating_text1.x=50;
		this.rating_text1.y=70;

		this.rating_text2=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 18,align: 'center'});
		this.rating_text2.tint=0xffff00;
		this.rating_text2.anchor.set(0.5,0);
		this.rating_text2.x=150;
		this.rating_text2.y=70;
		
		//
		this.rating_bcg = new PIXI.Sprite(game_res.resources.rating_bcg.texture);
		this.rating_bcg.width=200;
		this.rating_bcg.height=100;
		
		this.name1="";
		this.name2="";

		this.addChild(this.bcg,this.avatar, this.avatar1, this.avatar2, this.rating_bcg, this.rating_text,this.rating_text1,this.rating_text2, this.name_text);
	}

}

class lb_player_card_class extends PIXI.Container{

	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(game_res.resources.lb_player_card_bcg.texture);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};
		this.bcg.width = 370;
		this.bcg.height = 70;

		this.place=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.place.tint=0xffff00;
		this.place.x=20;
		this.place.y=22;

		this.avatar=new PIXI.Sprite();
		this.avatar.x=43;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;


		this.name=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.name.tint=0xdddddd;
		this.name.x=105;
		this.name.y=22;


		this.rating=new PIXI.BitmapText('', {fontName: 'mfont',fontSize: 25,align: 'center'});
		this.rating.x=298;
		this.rating.tint=0xff55ff;
		this.rating.y=22;

		this.addChild(this.bcg,this.place, this.avatar, this.name, this.rating);
	}


}

class player_class extends PIXI.Container{
		
	constructor(name) {
		
		super();
		
		this.anim_on;
		this.anim_source;
		this.anim_pos;
		this.anim_time;
		this.anim_speed;
		
		this.frozen=0;
		this.frozen_start=0;
		
		//это возможности
		this.powers={'block':999,'freeze':999,'fire':999, 'none':9999};
		this.powers_fire_time=[0,0,0];
				
		this.power='none';
		
		//это параметры фейкового игрока
		this.pref_dev_ang=0; // это диапазон добавочных углов
		this.dev_ang_error=[]; // -0.3 До 0.3
		this.idle_time_range=[];
		
		
		//это вероятности блокировки разных копий
		this.block_prob={'none':0, 'fire' :0 , 'freeze':0}
		
		//вероятности основных действий
		this.smart_0_prob=0;
		this.smart_1_prob=0;	
		this.freeze_prob=0;
		this.fire_prob=0;
		this.s_prob=0;
				
		//это время сколько ждать чтобы запустить огонь перед завершением фриза
		this.wait_burn_after_freeze=0;
		
		//это процессинговая функция
		this.process_func=function(){};
		this.process_start_time=0;
		
		this.skin_id=0;
		
		this.name=name;
		
		this.zz_spine=new PIXI.Sprite(gres.zz_spine.texture); this.zz_spine.width=40;	this.zz_spine.height=80;	this.zz_spine.anchor.set(0.5,0.5);
		
		this.zz_left_arm1=new PIXI.Sprite(gres.zz_left_arm1.texture);	this.zz_left_arm1.width=40;	this.zz_left_arm1.height=20;	this.zz_left_arm1.anchor.set(0.5,0.5);
		this.zz_left_arm2=new PIXI.Sprite(gres.zz_left_arm2.texture);	this.zz_left_arm2.width=40;	this.zz_left_arm2.height=20;	this.zz_left_arm2.anchor.set(0.5,0.5);
		this.zz_right_arm1=new PIXI.Sprite(gres.zz_right_arm1.texture);	this.zz_right_arm1.width=40;	this.zz_right_arm1.height=20;	this.zz_right_arm1.anchor.set(0.5,0.5);
		this.zz_right_arm2=new PIXI.Sprite(gres.zz_right_arm2.texture);	this.zz_right_arm2.width=40;	this.zz_right_arm2.height=20;	this.zz_right_arm2.anchor.set(0.5,0.5);
		
		this.zz_left_leg1=new PIXI.Sprite(gres.zz_left_leg1.texture);	this.zz_left_leg1.width=40;	this.zz_left_leg1.height=20;	this.zz_left_leg1.anchor.set(0.5,0.5);
		this.zz_left_leg2=new PIXI.Sprite(gres.zz_left_leg2.texture);	this.zz_left_leg2.width=40;	this.zz_left_leg2.height=20;	this.zz_left_leg2.anchor.set(0.5,0.5);
		this.zz_right_leg1=new PIXI.Sprite(gres.zz_right_leg1.texture);	this.zz_right_leg1.width=40;	this.zz_right_leg1.height=20;	this.zz_right_leg1.anchor.set(0.5,0.5);
		this.zz_right_leg2=new PIXI.Sprite(gres.zz_right_leg2.texture);	this.zz_right_leg2.width=40;	this.zz_right_leg2.height=20;	this.zz_right_leg2.anchor.set(0.5,0.5);
		this.zz_projectile=new PIXI.Sprite(gres.zz_projectile.texture);	this.zz_projectile.width=90;	this.zz_projectile.height=20;	this.zz_projectile.anchor.set(0.5,0.5);
			
		
		this.spine=new PIXI.Sprite(); this.spine.width=40;	this.spine.height=80;	this.spine.anchor.set(0.5,0.5);
		
		this.left_arm1=new PIXI.Sprite();	this.left_arm1.width=40;	this.left_arm1.height=20;	this.left_arm1.anchor.set(0.5,0.5);
		this.left_arm2=new PIXI.Sprite();	this.left_arm2.width=40;	this.left_arm2.height=20;	this.left_arm2.anchor.set(0.5,0.5);
		this.right_arm1=new PIXI.Sprite();	this.right_arm1.width=40;	this.right_arm1.height=20;	this.right_arm1.anchor.set(0.5,0.5);
		this.right_arm2=new PIXI.Sprite();	this.right_arm2.width=40;	this.right_arm2.height=20;	this.right_arm2.anchor.set(0.5,0.5);
		
		this.left_leg1=new PIXI.Sprite();	this.left_leg1.width=40;	this.left_leg1.height=20;	this.left_leg1.anchor.set(0.5,0.5);
		this.left_leg2=new PIXI.Sprite();	this.left_leg2.width=40;	this.left_leg2.height=20;	this.left_leg2.anchor.set(0.5,0.5);
		this.right_leg1=new PIXI.Sprite();	this.right_leg1.width=40;	this.right_leg1.height=20;	this.right_leg1.anchor.set(0.5,0.5);
		this.right_leg2=new PIXI.Sprite();	this.right_leg2.width=40;	this.right_leg2.height=20;	this.right_leg2.anchor.set(0.5,0.5);
		
		this.projectile_bcg=new PIXI.Sprite();	this.projectile_bcg.width=90;	this.projectile_bcg.height=20;	this.projectile_bcg.anchor.set(0.5,0.5);
		this.projectile_2=new PIXI.Sprite();	this.projectile_2.width=90;	this.projectile_2.height=20;	this.projectile_2.anchor.set(0.5,0.5);
		
		this.projectile=new PIXI.Container();
		this.projectile.addChild(this.projectile_bcg,this.projectile_2);
		
		//уровень жизни
		this.life_level_bcg=new PIXI.Sprite(game_res.resources.life_level_bcg.texture);
		this.life_level_bcg.x=10;
		this.life_level_bcg.width=130;
		this.life_level_bcg.height=30;
		this.life_level_frame=new PIXI.Sprite(game_res.resources.life_level_frame.texture);
		this.life_level_frame.x=10;
		this.life_level_frame.width=130;
		this.life_level_frame.height=30;
		this.life_level_front=new PIXI.Sprite(game_res.resources.life_level_front.texture);		
		this.life_level_front.x=20;
		this.life_level_front.width=110;
		this.life_level_front.height=30;
		this.life_level_base_scale = 0.66666;
				
		this.addChild(
		
		this.zz_left_arm1,
		this.zz_left_arm2,
		this.zz_right_arm1,
		this.zz_right_arm2,
		this.zz_left_leg1,
		this.zz_left_leg2,
		this.zz_right_leg1,
		this.zz_right_leg2,
		this.zz_spine,	
		this.zz_projectile,	
		this.left_arm1,
		this.left_arm2,
		this.right_arm1,
		this.right_arm2,
		this.left_leg1,
		this.left_leg2,
		this.right_leg1,
		this.right_leg2,
		this.spine,
		this.projectile,
		this.life_level_bcg,
		this.life_level_front,
		this.life_level_frame);
		
		this.base_col=JSON.parse(JSON.stringify(col_data));		
		this.cur_col=JSON.parse(JSON.stringify(col_data));	
		
		this.next_v=100;
		this.next_del_q=0.5;
		this.idle_time=0;
		
		this.life_level=100;

	};
	
	play_anim (anim) {
		
		this.anim_source = anim;
		this.anim_on = 1;
		this.anim_pos = 0;
		this.anim_time = 0;
		this.anim_speed = 1;
		some_process[this.name]=this.skl_anim_process.bind(this);		
	}
	
	skl_anim_process() {		
		
		//проигрываем анимацию для фона и для самой конечности
		for (var s in this.anim_source) {			
			this['zz_'+s].x=this[s].x=this.anim_source[s][this.anim_pos][0];
			this['zz_'+s].y=this[s].y=this.anim_source[s][this.anim_pos][1];
			this['zz_'+s].rotation=this[s].rotation=this.anim_source[s][this.anim_pos][2];
		}
				
		this.anim_time+=this.anim_speed;
		this.anim_pos=Math.floor(this.anim_time);
		
		//проверяем конец анимации
		if (this.anim_pos>=this.anim_source["left_arm1"].length)
			some_process[this.name]=function(){};
		
		this.update_collision();
	}
	
	skl_anim_tween(anim,amount) {		
		for (var s in anim) {			
			this['zz_'+s].x=this[s].x=anim[s][0][0]+anim[s][2][0]*amount;
			this['zz_'+s].y=this[s].y=anim[s][0][1]+anim[s][2][1]*amount;
			this['zz_'+s].rotation=this[s].rotation=anim[s][0][2]+anim[s][2][2]*amount;
		}		
		this.update_collision();
	}
	
	skl_anim_goto_frame(anim,frame_id) {		
		for (var s in anim) {			
			this['zz_'+s].x=this[s].x=anim[s][frame_id][0];
			this['zz_'+s].y=this[s].y=anim[s][frame_id][1];
			this['zz_'+s].rotation=this[s].rotation=anim[s][frame_id][2];
		}		
	}
	
	set_projectile_power(t) {
		
		t==='none'&&(this.projectile_bcg.texture=null);
		t==='freeze'&&(this.projectile_bcg.texture=gres.projectile_freeze.texture);
		t==='fire'&&(this.projectile_bcg.texture=gres.projectile_fire.texture);
		this.power=t;
	}
	
    shift_height(h_dist) {
        anim.add_pos({obj: this, param: 'y',  vis_on_end: true,  func: 'easeOutBack', val: ['y', this.sy + h_dist], speed: 0.02 });
    };
				
	decrease_life(val) {
		
		let new_lev=this.life_level-val;
		new_lev=Math.max(0,new_lev);	
		this.life_level=new_lev;
		this.life_level_front.scale_x=this.life_level_base_scale*this.life_level*0.01;
		
		if (new_lev === 0) {					
			if (this.name === my_player)
				game.stop('my_lose');			
			else
				game.stop('my_win');
		}
	};
	
	make_frozen() {
					
		this.frozen=1;
		this.frozen_start=game_tick;	
				
		if (this.name==='player') {
			touch.stop();
			skl_anim.slots[0].on=0;
		} else {
			
			skl_anim.slots[1].on=0;
		}
		
		this.set_skin_by_prefix('s1_');		
	}
	
	make_on_fire() {
		
		this.on_fire=1;
		this.on_fire_start=game_tick;
		this.fire.play();
		this.fire.visible=true;
		this.fire.alpha=1;
		gres.flame.sound.play();
		
	}
		
	update_collision() {
		
		//обновляем коллизии		
		for (let i=0;i<this.base_col.length;i++) {
			
			let limb_name=this.base_col[i][0];
			let ref_name=this.base_col[i][1];
			let data=this.base_col[i][2];
			
			let rot=this[ref_name].rotation;	
			
			for (let p = 0; p < data.length; p++) {
				
				let x=data[p][0];
				let y=data[p][1];

				let tx = x * Math.cos(rot) - y * Math.sin(rot);
				let ty = x * Math.sin(rot) + y * Math.cos(rot);

				if (this.scale_x===1) {
					this.cur_col[i][2][p][0] = this.x+this[ref_name].x+tx;
					this.cur_col[i][2][p][1] = this.y+this[ref_name].y+ty;					
				} else {
					this.cur_col[i][2][p][0] = this.x-this[ref_name].x-tx;
					this.cur_col[i][2][p][1] = this.y+this[ref_name].y+ty;		
				}
			}; 		
		}
		
		
	}
	
	process_common(init) {
					
		if (init===1) {			
			this.process_start_time=game_tick;		
			this.process_func=this.process_common;
			return;
		}		
				
		this.update_collision();

		//обрабатываем данный код только если идет игра
		if (state!=="playing") return;		
		
		//обрабатываем события замороженного игрока
		if (this.frozen===1) {				
			if (game_tick-this.frozen_start>5){
				this.frozen=0;
				
				//устанавливаем вид игрока
				skl_anim.goto_frame(this,skl_throw,0);
				
				//восстанавливаем скин
				this.set_skin_by_id();
			}
			return;
		};
		
		//обрабатываем события подожженного игрока
		if (this.on_fire===1) {

			this.decrease_life(0.1);
			if (game_tick-this.on_fire_start>5){
				this.on_fire=0;				
					anim.add_pos({obj:this.fire,param:'alpha',vis_on_end:false,func:'easeOutBack',val:[1,0],	speed:0.02});
			}
		};
		
		//обрабатываем время блока
		if (this.block.visible===true && this.block.ready===true) {
			if (game_tick>this.block_start+2) {
				anim.add_pos({obj: this.block,	param: 'alpha',	vis_on_end: false,	func: 'linear',	val: [1, 0],	speed: 0.1	});
			}	
			
			this.block.rotation+=0.1;
		}
				
	};
	
	process_idle(init) {
		
		
		if (init===1) {			
			this.process_start_time=game_tick;		
			this.process_func=this.process_idle;
			this.idle_time=rnd2(this.idle_time_range[0],this.idle_time_range[1]);
			return;
		}
		
		//общие функции
		this.process_common();
		
		if (this.frozen===1) return;		
		
		//сканируем копья чтобы активировать блок
		this.scan_projectiles();
		
		if (game_tick>this.process_start_time+this.idle_time)
			this.process_buildup(1);

		
	
	};
	
	set_skin_by_id(id) {
		
		let skin_prefix=""
		if (id===undefined) {
			skin_prefix=skins_powers[this.skin_id][0];		
		}else {
			this.skin_id=id;
			skin_prefix=skins_powers[id][0];
		}
		
		this.set_skin_by_prefix(skin_prefix);
		
	}
	
	set_skin_by_prefix (prefix) {
		
		this.left_leg1.texture=gres[prefix+'left_leg1'].texture
		this.left_leg2.texture=gres[prefix+'left_leg2'].texture
		this.right_leg1.texture=gres[prefix+'right_leg1'].texture
		this.right_leg2.texture=gres[prefix+'right_leg2'].texture
		
		this.left_arm1.texture=gres[prefix+'left_arm1'].texture
		this.left_arm2.texture=gres[prefix+'left_arm2'].texture
		this.right_arm1.texture=gres[prefix+'right_arm1'].texture
		this.right_arm2.texture=gres[prefix+'right_arm2'].texture
		
		this.spine.texture=gres[prefix+'spine'].texture;
		this.projectile_2.texture=gres[prefix+'projectile'].texture	
		
	}
		
	stop() {
		
		this.process_func=this.update_collision;
	}
	
	init(skin_prefix) {
		
		this.visible=true;
		
		//устанавливаем текстуры
		this.set_skin_by_prefix(skin_prefix);						
		
		//устанавливаем вид игрока
		this.skl_anim_goto_frame(skl_throw,0);
				
		//устанавливаем начальные значения сил
		this.set_life(100);
		//this.powers.block=skins_powers[this.skin_id][1];
		//this.powers.freeze=skins_powers[this.skin_id][2];
		//this.powers.fire=skins_powers[this.skin_id][3];
		
	}
	
	set_life(val) {		
		this.life_level=val;
		this.life_level_front.scale_x=this.life_level_base_scale*this.life_level*0.01;
	}

}

class projectile_class extends PIXI.Container {

	constructor() {
		super();
				
		this.x0 = 0;
		this.y0 = 0;
		this.on = 0;
		this.vx0 = 0;
		this.vy0 = 0;
		this.coll_obj=0;
		this.coll_obj_id=0;
		
		this.sx=0;
		this.sy=0;			
		
		this.int_x=0;
		this.int_y=0;
		
		this.P=0;
		this.t=0;
		this.disp=0;
		this.target = "";
		this.visible=false;

		
		this.process=function(){};
		
		this.p_bcg=new PIXI.Sprite();this.p_bcg.anchor.set(0.5,0.5);
		this.p_sprite=new PIXI.Sprite();this.p_sprite.anchor.set(0.5,0.5);
		this.power='none';
		
		this.finish_callback = function(){};
		
		this.addChild(this.p_bcg, this.p_sprite);
		
		objects.game_cont.addChild(this);			
		
	};		
	
	activate(params) {
		
		this.p_bcg.texture=gres.zz_projectile.texture;
		//params.power==='freeze'&&(this.p_bcg.texture=gres.projectile_freeze.texture);
		//params.power==='fire'&&(this.p_bcg.texture=gres.projectile_fire.texture);
					
		this.finish_callback = params.finish_callback;
		
		this.power=params.power;
		
		this.p_sprite.texture=params.spear;			
		
		this.vx0 = Math.cos(params.Q)*params.P;
		this.vy0 = Math.sin(params.Q)*params.P;
		
		this.target = params.target;
		
		if (objects.game_cont.scale_x < 0) {			
			anim2.add(objects.game_cont,{scale_x:[-1,-0.5],scale_y:[1,0.5]}, true, 7,'ease2back');
		} else {
			anim2.add(objects.game_cont,{scale_xy:[1,0.5]}, true, 7,'ease2back');	
		}

		

		if (this.target.name === "player1") {
			
			this.vx0=-this.vx0;				
			this.x0 = objects.player2.x-20;
			this.y0 = objects.player2.y+50;
			this.scale.x=1;
			
		} else {
			
			//запускаем снаряд в зависимости от наклона тела
			let dxv=Math.sin(objects.player1.spine.rotation);
			let dyv=-Math.cos(objects.player1.spine.rotation);			
			this.x0 = objects.player1.x+20;
			this.y0 = objects.player1.y+50;
			this
			.scale.x=-1;
		}
		this.x = this.x0;
		this.y = this.y0;
		
		this.width=90;
		this.height=20;
		
		this.P=params.P;
		this.t=0;
		
		this.rotation=params.Q;

		this.process=this.process_go;
		this.on = 1;
		this.visible = true;
		this.alpha = 1;
		
	};
			
	get_line () {

		let dx = Math.cos(this.rotation);
		let dy = Math.sin(this.rotation);
		
		let cor_width=this.width-15;

		//в копье работает только первая половина, чтобы не стукнуться о заднюю
		let dir=Math.sign(this.vx0);
		
		let x0 = this.x ;
		let y0 = this.y ;		
		
		let x1 = this.x + dir * dx * cor_width / 2;
		let y1 = this.y + dir * dy * cor_width / 2;

		return [x0, y0, x1, y1];

	};
	
	stop(int_x,int_y, coll_obj, coll_obj_id) {				

		this.on = 0;
		this.finish_callback();
		this.process = this.process_stop;	
		
		this.int_x=int_x;
		this.int_y=int_y;
		
		this.sx=this.x;
		this.sy=this.y;				
		
		this.coll_obj=coll_obj;
		this.coll_obj_id=coll_obj_id;
		
		//вычисляем расстояние от начала линии коллизии до точки пересечения
		let dx=int_x-this.coll_obj[this.coll_obj_id][0];
		let dy=int_y-this.coll_obj[this.coll_obj_id][1];
		this.disp=Math.sqrt(dx*dx+dy*dy);
			
	};
	
	async stop_on_block() {
		
		this.on = 0;
		this.process = function(){};		
		await new Promise((resolve, reject) => {setTimeout(resolve, 2000);});
		this.finish_callback();		
	}
	
	process_go() {
		
		if (this.visible === false)
			return;
		
		
		//console.log(objects.game_cont.scale_x,objects.game_cont.scale_y,objects.game_cont.scale_xy);
		let vx=this.vx0;
		let vy=9.8*this.t+this.vy0;

		this.x = this.x0+vx*this.t;
		this.y = this.y0+0.5*9.8*this.t*this.t+this.vy0*this.t;
		
		this.rotation=Math.atan(vy/vx);	
		this.t+=0.1;
		
		this.process_collisions();


		if (this.x>4800 || this.x<-500 || this.y>600 || this.y<-1000) {
			this.on = 0;	
			this.finish_callback();
			this.visible = false;
		}
		
	};
	
	process_stop () {			

		//это передвижение синхронно с конечностью в которое попала
		let dx=this.coll_obj[this.coll_obj_id+1][0]-this.coll_obj[this.coll_obj_id][0];
		let dy=this.coll_obj[this.coll_obj_id+1][1]-this.coll_obj[this.coll_obj_id][1];
		let d=Math.sqrt(dx*dx+dy*dy);
		dx=dx/d;
		dy=dy/d;
		
		this.x = this.sx+(this.coll_obj[this.coll_obj_id][0]+dx*this.disp-this.int_x);
		this.y = this.sy+(this.coll_obj[this.coll_obj_id][1]+dy*this.disp-this.int_y);
		
	}
	
	process_collisions() {
		
		if(this.on===1) {
			
			let l = this.get_line();	
		
			//проверяем столкновение с  частями тела игрока или оппонента
			for (let i=0;i<this.target.cur_col.length;i++) {
				
				let limb_name=this.target.cur_col[i][0];
				let ref_shape=this.target.cur_col[i][1];
				let data=this.target.cur_col[i][2];
				
				for (let p = 0; p < data.length - 1; p++) {									
											
					let res = this.get_line_intersection(l[0], l[1], l[2], l[3], data[p][0], data[p][1], data[p + 1][0], data[p + 1][1]);
					if (res[0] !== -999 && this.on===1) {
													
						console.log('Collision: ' + limb_name)
						
						if (limb_name === 'head')
							this.target.decrease_life(50)
						else
							this.target.decrease_life(40)
						
						//останавливаем копье
						this.stop(res[0], res[1], this.target.cur_col[i][2], p);
					}						
				}					
			}	
			
			//проверяем столкновения с другими статичными объектами
			for (let i=0;i<map_col_data.length;i++) {
				
				const obj = map_col_data[i];
				
				for (let j = 0 ; j <obj.length -1 ; j++) {
					
					
					let p0 = obj[j];
					let p1 = obj[j+1];
					
					let res = this.get_line_intersection(l[0], l[1], l[2], l[3], p0[0], p0[1], p1[0], p1[1]);
					if (res[0] !== -999 && this.on===1) {
													
						console.log('Collision: ' + 'block')
						//останавливаем копье
						this.stop_on_block();
					}										
					
				}
				
			}
			
			
		}	
	}
	
	get_line_intersection(p0_x, p0_y, p1_x, p1_y, p2_x, p2_y, p3_x, p3_y) {
		let i_x,
		i_y;
		let s1_x,
		s1_y,
		s2_x,
		s2_y;
		s1_x = p1_x - p0_x;
		s1_y = p1_y - p0_y;
		s2_x = p3_x - p2_x;
		s2_y = p3_y - p2_y;

		let s,
		t;
		s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
		t = (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);

		if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
			return [p0_x + (t * s1_x), p0_y + (t * s1_y)];
		return [-999, -999];
	}
	
}

confirm_dialog = {
	
	p_resolve : 0,
		
	show: function(msg) {
								
		if (objects.confirm_cont.visible === true) {
			sound.play('locked')
			return;			
		}		
		
		sound.play("confirm_dialog");
				
		objects.confirm_msg.text=msg;
		
		anim2.add(objects.confirm_cont,{y:[450,objects.confirm_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			confirm_dialog.p_resolve = resolve;	  		  
		});
	},
	
	button_down : function(res) {
		
		if (objects.confirm_cont.ready===false)
			return;
		
		sound.play('click')

		this.close();
		this.p_resolve(res);	
		
	},
	
	close : function() {
		
		anim2.add(objects.confirm_cont,{y:[objects.confirm_cont.sy,450]}, false, 0.4,'easeInBack');		
		
	}

}

anim2 = {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
	empty_spr : {x:0, visible:false, ready:true, alpha:0},
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	
	
	any_on : function() {
		
		for (let s of this.slot)
			if (s !== null)
				return true
		return false;		
	},
	
	linear: function(x) {
		return x
	},
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj)
					this.slot[i]=null;		
	},
	
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeOutElastic: function(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	
	easeOutSine: function(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	easeOutBounce: function(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	
	easeInCubic: function(x) {
		return x * x * x;
	},
	
	ease2back : function(x) {
		return Math.sin(x*Math.PI*2);
	},
	
	easeInOutCubic: function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	shake : function(x) {
		
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
		
		
	},	
	
	add : function(obj, params, vis_on_end, time, func, anim3_origin) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);
		/*if (anim3_origin === undefined)
			anim3.kill_anim(obj);*/

		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {

				obj.visible = true;
				obj.ready = false;

				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];
				}
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back')
					for (let key in params)
						params[key][1]=params[key][0];					
					
				this.slot[i] = {
					obj: obj,
					params: params,
					vis_on_end: vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

		
		

	},	
	
	process: function () {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;		
				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		
				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
					
					s.obj.visible=s.vis_on_end;
					if (s.vis_on_end === false)
						s.obj.alpha = 1;
					
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	},
	
	wait : async function(time) {
		
		await this.add(this.empty_spr,{x:[0, 1]}, false, time,'linear');	
		
	}
}

sound = {
	
	on : 1,
	
	play : function(snd_res) {
		
		if (this.on === 0)
			return;
		
		if (game_res.resources[snd_res]===undefined)
			return;
		
		game_res.resources[snd_res].sound.play();	
		
	},
	
	play_delayed (snd_res, delay) {
		
		if (this.on === 0)
			return;
		
		if (game_res.resources[snd_res]===undefined)
			return;
		
		
		setTimeout(function(){game_res.resources[snd_res].sound.play()}, delay);
			
		
	}
	
	
}

message =  {
	
	promise_resolve :0,
	
	add : async function(text, timeout) {
		
		if (this.promise_resolve!==0)
			this.promise_resolve("forced");
		
		if (timeout === undefined) timeout = 3000;
		
		//воспроизводим звук
		sound.play('message');

		objects.message_text.text=text;

		await anim2.add(objects.message_cont,{alpha:[0,1]}, true, 0.25,'linear');

		let res = await new Promise((resolve, reject) => {
				message.promise_resolve = resolve;
				setTimeout(resolve, timeout)
			}
		);
		
		if (res === "forced")
			return;

		anim2.add(objects.message_cont,{alpha:[1, 0]}, false, 0.25,'linear');			
	},
	
	clicked : function() {
		
		
		message.promise_resolve();
		
	}

}

big_message = {
	
	p_resolve : 0,
	show_time : 0,
		
	show: async function(t1,t2) {				
				
		this.show_time = Date.now();
				
		objects.big_message_text.text = t1;
		objects.big_message_text2.text = t2;
		anim2.add(objects.big_message_cont,{y:[600,objects.big_message_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			big_message.p_resolve = resolve;	  		  
		});
	
	},	

	ok_down : function() {
		
		this.close('OK');
		
	},

	close : async function(info) {
		
		if (objects.big_message_cont.ready===false)
			return;
		
		sound.play('click');
		await anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.y,600]}, false, 0.4,'easeInBack');		
		this.p_resolve(info);			
	}

}

mp_game = {
	
	name : 'online',
	start_time : 0,
	disconnect_time : 0,
	me_conf_play : 0,
	opp_conf_play : 0,
	made_moves: 0,
	my_role : '',
			
	activate : async function () {
		
		opponent = this;
					
		//фиксируем врему начала игры для статистики
		this.start_time = Date.now();
		
		objects.desktop.texture = gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.6,'linear');		
		
		//устанавливаем локальный и удаленный статус
		set_state({state : 'p'});
				
	},
		
	send_message : async function() {
				
		let msg_data = await feedback.show();
		
		if (msg_data[0] === 'sent') {			
			firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"CHAT",tm:Date.now(),data:msg_data[1]});	

		} else {			
			message.add('Сообщение не отправлено');
		}
		
	},
	
	send_move(Q,P) {
		
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MOVE",tm:Date.now(),data:[Q,P]});	
		
	},	
		
	incoming_move_finished : function() {
		
		console.log('Прилетело копье к оппоненту ',objects.game_cont.scale_x);
		obj_to_follow = opp_player;
	
	},		

	giveup : async function() {
		
		if (this.made_moves < 3) {
			message.add(['Нельзя сдаваться в начале игры','Do not give up so early'][LANG])
			return;
		}
		
		let res = await confirm_dialog.show(['Сдаетесь?','GiveUP?'][LANG])
		
		if (res !== 'ok') return;
		
		//заканчиваем игру поражением
		this.stop('my_giveup')
		
		//отправляем сопернику что мы сдались
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"GIVEUP",tm:Date.now()});
		
	},
	
	chat : function(data) {
		
		message.add(data, 10000);
		
	},
	
	close : function() {
		

	}
	
}

sp_game = {

	name :'bot',
	on : 0,
	state : 'opp_move',
	center_size : 0,
	true_rating : null,
	receive_move_time : 0,

	activate: async function(role, seed) {
		
		//сохраняем рейтинг
		this.true_rating = my_data.rating;
		this.on = 1;		
		
		//рейтинг не настоящий поэтому его затемняем
		objects.my_card_rating.alpha = 0.5;

		opponent = this;
		
		opp_data.uid = 'BOT';
		opp_data.rating = 100;		
		
		objects.desktop.texture = gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.6,'linear');				
		
		//устанавливаем локальный и удаленный статус
		set_state ({state : 'b'});	
			
		this.sp_start = game_tick;
		
		

	},
	
	process : function() {
					

		
	},	
	
	send_move(Q,P) {
		
		
		
	},
		
	incoming_move_finished : async function() {
		
		obj_to_follow = opp_player;
		console.log('incoming_move_finished');
		
		await new Promise((resolve, reject) => {setTimeout(resolve, 2000);});
		
		if (this.on === 0) return;
		
		//запускаем анимацию
		objects[opp_player].play_anim(skl_throw);			
		
		//запускаем снаряд бота
		let projectile = game.add_projectile({	Q : -0.8,
							P : rnd2(60,160),
							spear : objects[opp_player].projectile_2.texture,
							target : objects[my_player],
							power : 30,
							finish_callback : game.incoming_move_finished.bind(game)							
							});
				
		obj_to_follow = projectile;
		objects[opp_player].projectile.visible = false;
		objects[opp_player].zz_projectile.visible = false;
				
		setTimeout(function(){objects[opp_player].projectile.visible=true;objects[opp_player].zz_projectile.visible=true},1700);	
		
	},

	reset_timer : function() {
		
		
	},
			
	stop : function() {
		
		this.on = 0;
		
	},
			
	close : async function() {
		
		//восстанавливаем рейтинг
		if (this.true_rating !== null)
			my_data.rating = this.true_rating;			
		objects.my_card_rating.text = my_data.rating;
		objects.my_card_rating.alpha = 1;
		this.true_rating = null;
		
		this.on = 0;	
		
	},
	
	switch_close : function() {
		
		this.close();	
		
	}

}

game = {	

	start_player : 0,
	start_time : 0,
	tar_pivot_x:0,
	tar_pivot_y:0,
	opponent : {},
	map_data : {},
	
	activate : async function(start_player, opponent){
		
		
		//console.log("Загружаем текстуру "+objects.mini_cards[id].name)
		var map_loader = new PIXI.Loader();	
		map_loader.add("map_load_list", "map0/map_load_list.txt",{timeout: 5000});
		map_loader.add("map_col_data", "map0/collisions.txt",{timeout: 5000});
		await new Promise(function(resolve, reject) {map_loader.load(function(l,r) {	resolve(l)});});
		
		this.map_data = eval(map_loader.resources.map_load_list.data);
		map_col_data = eval(map_loader.resources.map_col_data.data);
		
		//добавляем из листа загрузки карты
		for (var i = 0; i < this.map_data.length; i++)
			if (this.map_data[i].class === "sprite" || this.map_data[i].class === "image" )
				map_loader.add(this.map_data[i].name, git_src+'map0/' + this.map_data[i].name + "." +  this.map_data[i].image_format);
		await new Promise(function(resolve, reject) {map_loader.load(function(l,r) {	resolve(l)});});
		
		
		//устанаваем объекты сцены
		for (var i = 0; i < this.map_data.length; i++) {
			const obj_class = this.map_data[i].class;
			const obj_name = this.map_data[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name].texture = map_loader.resources[obj_name].texture;
				eval(this.map_data[i].code0);
				break;

			case "block":
				eval(this.map_data[i].code0);
				break;

			}
		}
		
		//устанаваем фон
		objects.bcg.texture = map_loader.resources.bcg.texture;
			
		
		this.opponent = opponent;
		
		if (start_player === ME)
			my_turn = 1
		else
			my_turn = 0
				
		this.start_time = game_tick;
		
		//если открыт лидерборд то закрываем его
		if (objects.lb_1_cont.visible===true)
			lb.close();		
		
		//выключаем бота соперника если он работает
		sp_game.switch_close();
		
		//активируем все что связано с онлайн или ботом
		await opponent.activate();
		
		//убираем все стрелы
		objects.projectiles.forEach(p => {
			p.on = 0;
			p.visible = false;
		})
		
		//восстанавливаем жизни игроков
		
		//показыаем карточки
		anim2.add(objects.my_card_cont,{x:[-100,objects.my_card_cont.sx]}, true, 0.6,'easeOutBack');	
		anim2.add(objects.opp_card_cont,{x:[-100,objects.opp_card_cont.sx]}, true, 0.6,'easeOutBack');	
				
		//устанавливаем кто начальный игрок 
		this.start_player = start_player;	
		
		objects.game_cont.visible = true;

		//инициируем игроков
		objects.player1.init('s0_');
		objects.player2.init('s0_');
		
		
		//персчитываем коллизии
		objects.player1.update_collision();
		objects.player2.update_collision();
		
		some_process.game = this.process.bind(this);
		objects.desktop.interactive = true;
		my_player = ['player1','player2'][start_player];
		opp_player = ['player1','player2'][1 - start_player];
		
		if (start_player === ME)
			obj_to_follow = my_player;
		else
			obj_to_follow = opp_player;
		
		if (start_player === OPP)
			objects.game_cont.scale_x = -1;
		
		
		
	},
	
	process : function() {
		
		
		if (obj_to_follow === 'player1') {
			this.tar_pivot_x = objects.player1.x + objects.player1.projectile.x;
			this.tar_pivot_y = objects.player1.y + objects.player1.projectile.y;		
		}
		
		if (obj_to_follow === 'player2') {
			this.tar_pivot_x = objects.player2.x - objects.player2.projectile.x;
			this.tar_pivot_y = objects.player2.y + objects.player2.projectile.y;		
		}
		
		if (obj_to_follow!== null && typeof(obj_to_follow) === 'object') {
			
			this.tar_pivot_x = obj_to_follow.x ;
			this.tar_pivot_y = obj_to_follow.y;			
		}
		
		let dx = this.tar_pivot_x - objects.game_cont.pivot.x;
		let dy = this.tar_pivot_y - objects.game_cont.pivot.y;
		let d = Math.sqrt(dx*dx+dy*dy);
		
		if (d>10) {
			
		objects.game_cont.pivot.x += dx/10;
		objects.game_cont.pivot.y += dy/10;
		objects.bcg.tilePosition.x-=dx/100;
		objects.bcg.tilePosition.y-=dy/100;
		}
				
		
		objects.bcg.tileScale.x=objects.bcg.tileScale.y=Math.abs(objects.game_cont.scale_x)/4+0.75;
				
		objects.projectiles.forEach(p=>p.process());
			
	},

	incoming_move : function(move_data) {
		
		//получение хода от игрока другого
		
		
		//запускаем анимацию
		objects[opp_player].play_anim(skl_throw);	
		
		//запускаем снаряд
		let projectile = game.add_projectile({	Q : move_data[0],
							P : move_data[1],
							spear : objects[opp_player].projectile_2.texture,
							target : objects[my_player],
							power : 30,
							finish_callback : game.incoming_move_finished.bind(game)							
							});
							
		obj_to_follow = projectile;
		objects[opp_player].projectile.visible = false;
		objects[opp_player].zz_projectile.visible = false;		
		
		setTimeout(function(){objects[opp_player].projectile.visible=true;objects[opp_player].zz_projectile.visible=true},1700);	
		
	},
	
	incoming_move_finished : function() {
		
		console.log('Прилетело копье ко мне ',objects.game_cont.scale_x);
		my_turn = 1;	
		obj_to_follow = my_player;
		
	},
	
	add_projectile : function(params) {
		
		//ищем свободное копье
		for (let p of objects.projectiles) {
			if (p.visible===false){
				p.activate(params);
				return p;				
			}
		}
		
		//если не нашли пустую
		objects.projectiles[p].activate(params);
		return objects.projectiles[p];
		
	},

	stop : async function(result) {
		
		objects.desktop.interactive = false;
		
		this.opponent.stop();
		await big_message.show('Игра окончена','Рейтинг 3-3');
		this.close();
		main_menu.activate();
		
		
	},

	close : function() {
		
		//показыаем карточки
		anim2.add(objects.my_card_cont,{x:[objects.my_card_cont.sx,-100]}, false, 0.4,'easeInBack');	
		anim2.add(objects.opp_card_cont,{x:[objects.opp_card_cont.sx,-100]}, false, 0.4,'easeInBack');	
		anim2.add(objects.game_cont,{alpha:[1,0]}, false, 0.4,'linear');	

		some_process.game = function(){};
		this.opponent.close();
		
		ad.show();
		
		set_state({state : 'o'});			
		
				
	}
	
}

touch = {

	Q:0,
	moved:0,
	touch_len:0,

	touch_data : {
		x0: 0,
		y0: 0,
		x1: 0,
		y1: 0
	},

    down: function (e) {
		
		this.Q=0;
		
		if (my_turn === 0) return;
		
		objects.guide_line.visible = true;
		
        this.touch_data.x0 = e.data.global.x / app.stage.scale.x;
        this.touch_data.y0 = e.data.global.y / app.stage.scale.y;

        this.touch_data.x1 = this.touch_data.x0;
        this.touch_data.y1 = this.touch_data.y0;		
		

		
		/*
		if (game.state!=="playing")
			return;
		
		if (objects.player.frozen===1)
			return;



		guide_line.visible = objects.dir_line.visible = objects.power_level_cont.visible = true;
		
		objects.power_slider.scale.x=0;
		
		this.p=0;
		
		objects.dir_line.x = objects.player.x+objects.player.width/2;
		objects.dir_line.y = objects.player.y+40;*/
		
        drag = 1;
    },

    move: function (e) {
		
		if (my_turn === 0) return;

        if (drag === 1) {
			
            this.touch_data.x1 = e.data.global.x / app.stage.scale.x;
            this.touch_data.y1 = e.data.global.y / app.stage.scale.y;
            
			let dx = this.touch_data.x1 - this.touch_data.x0;
			let dy = this.touch_data.y1 - this.touch_data.y0;

			this.touch_len = Math.sqrt(dx * dx + dy * dy);
			this.touch_len = Math.max(50, Math.min(this.touch_len, 300));

			this.Q = Math.atan2(dy, dx);
			this.Q = Math.max(-1.57, Math.min(this.Q, 0));
			objects[my_player].skl_anim_tween(skl_prepare,0.5+this.Q/0.785398/2);

			//обновляем данные на основе корректированной длины
			this.touch_data.x1 = this.touch_data.x0 + this.touch_len * Math.cos(this.Q);
			this.touch_data.y1 = this.touch_data.y0 + this.touch_len * Math.sin(this.Q);

			objects.guide_line.clear();
			objects.guide_line.lineStyle(1, 0x00ff00)
			objects.guide_line.moveTo(this.touch_data.x0, this.touch_data.y0);
			objects.guide_line.lineTo(this.touch_data.x1, this.touch_data.y1);
			
			
			//отображаем направляющую в зависимости от наклона тела
			let dxv=Math.sin(objects[my_player].spine.rotation);
			let dyv=-Math.cos(objects[my_player].spine.rotation);			
			//objects.dir_line.x = objects.player.x+objects.player.spine.x+dxv*30;
			//objects.dir_line.y = objects.player.y+objects.player.spine.y+dyv*30;
			
			//это значит что движение произведено
			this.moved=1;
			
			//objects.dir_line.rotation=this.Q;

        }

    },

    up: function () {
		
		if (my_turn === 0) return;
		
		if (drag === 0) return;
		
        objects.guide_line.visible =  false;
		
		//запускаем локальный снаряд и получаем его ссылку
		let Q = this.Q;
		let P = this.touch_len*0.5;
        let projectile = game.add_projectile({
			Q : Q,
			P : P,
			target : objects[opp_player],
			spear : objects[my_player].projectile_2.texture,
			power : 30,
			finish_callback : game.opponent.incoming_move_finished.bind(game.opponent)
		});		
		
		obj_to_follow = projectile;
        drag = 0;	
		my_turn = 0;
		
		game.opponent.send_move(Q,P);
		
		//запускаем анимацию
		objects[my_player].play_anim(skl_throw);
		objects[my_player].projectile.visible = false;
		objects[my_player].zz_projectile.visible = false;

			
		
		setTimeout(function(){objects[my_player].projectile.visible=true;objects[my_player].zz_projectile.visible=true},1700);	

    },
	
	stop: function() {
		
		guide_line.visible = objects.dir_line.visible = objects.power_level_cont.visible = false;
		drag = 0;
		
	}

}

make_text = function (obj, text, max_width) {

	let sum_v=0;
	let f_size=obj.fontSize;

	for (let i=0;i<text.length;i++) {

		let code_id=text.charCodeAt(i);
		let char_obj=game_res.resources.m2_font.bitmapFont.chars[code_id];
		if (char_obj===undefined) {
			char_obj=game_res.resources.m2_font.bitmapFont.chars[83];
			text = text.substring(0, i) + 'S' + text.substring(i + 1);
		}

		sum_v+=char_obj.xAdvance*f_size/64;
		if (sum_v>max_width) {
			obj.text =  text.substring(0,i-1);
			return;
		}
	}

	obj.text =  text;
}

ad = {
	
	prv_show : -9999,
		
	show : function() {
		
		if ((Date.now() - this.prv_show) < 100000 )
			return;
		this.prv_show = Date.now();
		
		if (game_platform==='YANDEX') {			
			//показываем рекламу
			window.ysdk.adv.showFullscreenAdv({
			  callbacks: {
				onClose: function() {}, 
				onError: function() {}
						}
			})
		}
		
		if (game_platform==='VK') {
					 
			vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
			.then(data => console.log(data.result))
			.catch(error => console.log(error));	
		}			
		
		if (game_platform==='CRAZYGAMES') {				
			try {
				const crazysdk = window.CrazyGames.CrazySDK.getInstance();
				crazysdk.init();
				crazysdk.requestAd('midgame');		
			} catch (e) {			
				console.error(e);
			}	
		}	
		
		if (game_platform==='GM') {
			sdk.showBanner();
		}
	},
	
	show2 : async function() {
		
		
		if (game_platform ==="YANDEX") {
			
			let res = await new Promise(function(resolve, reject){				
				window.ysdk.adv.showRewardedVideo({
						callbacks: {
						  onOpen: () => {},
						  onRewarded: () => {resolve('ok')},
						  onClose: () => {resolve('err')}, 
						  onError: (e) => {resolve('err')}
					}
				})
			
			})
			return res;
		}
		
		if (game_platform === "VK") {	

			let res = '';
			try {
				res = await vkBridge.send("VKWebAppShowNativeAds", { ad_format: "reward" })
			}
			catch(error) {
				res ='err';
			}
			
			return res;				
			
		}	
		
		return 'err';
		
	}

}

confirm_dialog = {
	
	p_resolve : 0,
		
	show: function(msg) {
								
		if (objects.confirm_cont.visible === true) {
			sound.play('locked')
			return;			
		}		
		
		sound.play("confirm_dialog");
				
		objects.confirm_msg.text=msg;
		
		anim2.add(objects.confirm_cont,{y:[450,objects.confirm_cont.sy]}, true, 0.6,'easeOutBack');		
				
		return new Promise(function(resolve, reject){					
			confirm_dialog.p_resolve = resolve;	  		  
		});
	},
	
	button_down : function(res) {
		
		if (objects.confirm_cont.ready===false)
			return;
		
		sound.play('click')

		this.close();
		this.p_resolve(res);	
		
	},
	
	close : function() {
		
		anim2.add(objects.confirm_cont,{y:[objects.confirm_cont.sy,450]}, false, 0.4,'easeInBack');		
		
	}

}

keep_alive= function() {
	
	if (h_state === 1) {		
		
		//убираем из списка если прошло время с момента перехода в скрытое состояние		
		let cur_ts = Date.now();	
		let sec_passed = (cur_ts - hidden_state_start)/1000;		
		if ( sec_passed > 100 )	firebase.database().ref(room_name+"/"+my_data.uid).remove();
		return;		
	}


	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	firebase.database().ref("inbox/"+my_data.uid).onDisconnect().remove();
	firebase.database().ref(room_name+"/"+my_data.uid).onDisconnect().remove();

	set_state({});
}

process_new_message=function(msg) {

	//проверяем плохие сообщения
	if (msg===null || msg===undefined)
		return;

	//принимаем только положительный ответ от соответствующего соперника и начинаем игру
	if (msg.message==="ACCEPT"  && pending_player===msg.sender && state !== "p") {
		//в данном случае я мастер и хожу вторым
		opp_data.uid=msg.sender;
		game_id=msg.game_id;
		cards_menu.accepted_invite(msg.seed);
	}

	//принимаем также отрицательный ответ от соответствующего соперника
	if (msg.message==="REJECT"  && pending_player === msg.sender) {
		cards_menu.rejected_invite();
	}

	//получение сообщение в состояни игры
	if (state==="p") {

		//учитываем только сообщения от соперника
		if (msg.sender===opp_data.uid) {

			//получение стикера
			if (msg.message==="MSG")
				stickers.receive(msg.data);
			
			//получение сообщение с ходом игорка
			if (msg.message==="CHAT")
				mp_game.chat(msg.data);			

			//получение сообщение с ходом игорка
			if (msg.message==='MOVE')
				game.incoming_move(msg.data);
			
		}
	}

	//приглашение поиграть
	if(state==="o" || state==="b") {
		if (msg.message==="INV") {
			req_dialog.show(msg.sender);
		}
		if (msg.message==="INV_REM") {
			//запрос игры обновляет данные оппонента поэтому отказ обрабатываем только от актуального запроса
			if (msg.sender === req_dialog._opp_data.uid)
				req_dialog.hide(msg.sender);
		}
	}

}

req_dialog = {

	_opp_data : {} ,
	
	show(uid) {

		firebase.database().ref("players/"+uid).once('value').then((snapshot) => {

			//не показываем диалог если мы в игре
			if (state === 'p')
				return;

			player_data=snapshot.val();

			//показываем окно запроса только если получили данные с файербейс
			if (player_data===null) {
				//console.log("Не получилось загрузить данные о сопернике");
			}	else	{

				//так как успешно получили данные о сопернике то показываем окно
				sound.play('receive_sticker');
			
				anim2.add(objects.req_cont,{y:[-260, objects.req_cont.sy]}, true, 0.75,'easeOutElastic');


				//Отображаем  имя и фамилию в окне приглашения
				req_dialog._opp_data.name=player_data.name;
				make_text(objects.req_name,player_data.name,200);
				objects.req_rating.text=player_data.rating;
				req_dialog._opp_data.rating=player_data.rating;

				//throw "cut_string erroor";
				req_dialog._opp_data.uid = uid;

				//загружаем фото
				this.load_photo(player_data.pic_url);

			}
		});
	},

	load_photo: function(pic_url) {


		//сначала смотрим на загруженные аватарки в кэше
		if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {

			//console.log("Загружаем текстуру "+objects.mini_cards[id].name)
			var loader = new PIXI.Loader();
			loader.add("inv_avatar", pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});
			loader.load((loader, resources) => {
				objects.req_avatar.texture=loader.resources.inv_avatar.texture;
			});
		}
		else
		{
			//загружаем текустуру из кэша
			//console.log("Ставим из кэша "+objects.mini_cards[id].name)
			objects.req_avatar.texture=PIXI.utils.TextureCache[pic_url];
		}

	},

	reject: function() {

		if (objects.req_cont.ready===false || objects.req_cont.visible===false)
			return;
		
		sound.play('close');



		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

		firebase.database().ref("inbox/"+req_dialog._opp_data.uid).set({sender:my_data.uid,message:"REJECT",tm:Date.now()});
	},

	accept: function() {

		if (objects.req_cont.ready===false || objects.req_cont.visible===false ||  objects.confirm_cont.visible===true || objects.big_message_cont.visible===true || anim2.any_on() === true)
			return;
		
		//устанавливаем окончательные данные оппонента
		opp_data = req_dialog._opp_data;	
	
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

		//отправляем информацию о согласии играть с идентификатором игры
		game_id=~~(Math.random()*999);
				
		
		
		//отправляем данные о начальных параметрах игры сопернику
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"ACCEPT", tm:Date.now(), game_id : game_id});

		//заполняем карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,150);
		objects.opp_card_rating.text=objects.req_rating.text;
		objects.opp_avatar.texture=objects.req_avatar.texture;

		main_menu.close();
		cards_menu.close();
		sp_game.switch_close();
		
		game.activate(ME, mp_game);

	},

	hide: function() {

		//если диалог не открыт то ничего не делаем
		if (objects.req_cont.ready === false || objects.req_cont.visible === false)
			return;
	
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

	}

}

feedback = {
		
	rus_keys : [[50,176,80,215.07,'1'],[90,176,120,215.07,'2'],[130,176,160,215.07,'3'],[170,176,200,215.07,'4'],[210,176,240,215.07,'5'],[250,176,280,215.07,'6'],[290,176,320,215.07,'7'],[330,176,360,215.07,'8'],[370,176,400,215.07,'9'],[410,176,440,215.07,'0'],[491,176,541,215.07,'<'],[70,224.9,100,263.97,'Й'],[110,224.9,140,263.97,'Ц'],[150,224.9,180,263.97,'У'],[190,224.9,220,263.97,'К'],[230,224.9,260,263.97,'Е'],[270,224.9,300,263.97,'Н'],[310,224.9,340,263.97,'Г'],[350,224.9,380,263.97,'Ш'],[390,224.9,420,263.97,'Щ'],[430,224.9,460,263.97,'З'],[470,224.9,500,263.97,'Х'],[510,224.9,540,263.97,'Ъ'],[90,273.7,120,312.77,'Ф'],[130,273.7,160,312.77,'Ы'],[170,273.7,200,312.77,'В'],[210,273.7,240,312.77,'А'],[250,273.7,280,312.77,'П'],[290,273.7,320,312.77,'Р'],[330,273.7,360,312.77,'О'],[370,273.7,400,312.77,'Л'],[410,273.7,440,312.77,'Д'],[450,273.7,480,312.77,'Ж'],[490,273.7,520,312.77,'Э'],[70,322.6,100,361.67,'!'],[110,322.6,140,361.67,'Я'],[150,322.6,180,361.67,'Ч'],[190,322.6,220,361.67,'С'],[230,322.6,260,361.67,'М'],[270,322.6,300,361.67,'И'],[310,322.6,340,361.67,'Т'],[350,322.6,380,361.67,'Ь'],[390,322.6,420,361.67,'Б'],[430,322.6,460,361.67,'Ю'],[511,322.6,541,361.67,')'],[451,176,481,215.07,'?'],[30,371.4,180,410.47,'ЗАКРЫТЬ'],[190,371.4,420,410.47,'_'],[430,371.4,570,410.47,'ОТПРАВИТЬ'],[531,273.7,561,312.77,','],[471,322.6,501,361.67,'('],[30,273.7,80,312.77,'EN']],	
	eng_keys : [[50,176,80,215.07,'1'],[90,176,120,215.07,'2'],[130,176,160,215.07,'3'],[170,176,200,215.07,'4'],[210,176,240,215.07,'5'],[250,176,280,215.07,'6'],[290,176,320,215.07,'7'],[330,176,360,215.07,'8'],[370,176,400,215.07,'9'],[410,176,440,215.07,'0'],[491,176,541,215.07,'<'],[110,224.9,140,263.97,'Q'],[150,224.9,180,263.97,'W'],[190,224.9,220,263.97,'E'],[230,224.9,260,263.97,'R'],[270,224.9,300,263.97,'T'],[310,224.9,340,263.97,'Y'],[350,224.9,380,263.97,'U'],[390,224.9,420,263.97,'I'],[430,224.9,460,263.97,'O'],[470,224.9,500,263.97,'P'],[130,273.7,160,312.77,'A'],[170,273.7,200,312.77,'S'],[210,273.7,240,312.77,'D'],[250,273.7,280,312.77,'F'],[290,273.7,320,312.77,'G'],[330,273.7,360,312.77,'H'],[370,273.7,400,312.77,'J'],[410,273.7,440,312.77,'K'],[450,273.7,480,312.77,'L'],[471,322.6,501,361.67,'('],[70,322.6,100,361.67,'!'],[150,322.6,180,361.67,'Z'],[190,322.6,220,361.67,'X'],[230,322.6,260,361.67,'C'],[270,322.6,300,361.67,'V'],[310,322.6,340,361.67,'B'],[350,322.6,380,361.67,'N'],[390,322.6,420,361.67,'M'],[511,322.6,541,361.67,')'],[451,176,481,215.07,'?'],[30,371.4,180,410.47,'CLOSE'],[190,371.4,420,410.47,'_'],[430,371.4,570,410.47,'SEND'],[531,273.7,561,312.77,','],[30,273.7,80,312.77,'RU']],
	keyboard_layout : [],
	lang : '',
	p_resolve : 0,
	MAX_SYMBOLS : 50,
	uid:0,
	
	show : function(uid) {
		
		this.set_keyboard_layout(['RU','EN'][LANG]);				
		this.uid = uid;
		objects.feedback_msg.text ='';
		objects.feedback_control.text = `0/${this.MAX_SYMBOLS}`
				
		anim2.add(objects.feedback_cont,{y:[-400, objects.feedback_cont.sy]}, true, 0.4,'easeOutBack');	
		return new Promise(function(resolve, reject){					
			feedback.p_resolve = resolve;	  		  
		});
		
	},
	
	set_keyboard_layout(lang) {
		
		this.lang = lang;
		
		if (lang === 'RU') {
			this.keyboard_layout = this.rus_keys;
			objects.feedback_bcg.texture = gres.feedback_bcg_rus.texture;
		} 
		
		if (lang === 'EN') {
			this.keyboard_layout = this.eng_keys;
			objects.feedback_bcg.texture = gres.feedback_bcg_eng.texture;
		}
		
	},
	
	close : function() {
			
		anim2.add(objects.feedback_cont,{y:[objects.feedback_cont.y,450]}, false, 0.4,'easeInBack');		
		
	},
	
	get_texture_for_key (key) {
		
		if (key === '<' || key === 'EN' || key === 'RU') return gres.hl_key1.texture;
		if (key === 'ЗАКРЫТЬ' || key === 'ОТПРАВИТЬ' || key === 'SEND' || key === 'CLOSE') return gres.hl_key2.texture;
		if (key === '_') return gres.hl_key3.texture;
		return gres.hl_key0.texture;
	},
	
	key_down : function(key) {
		
		
		if (objects.feedback_cont.visible === false || objects.feedback_cont.ready === false) return;
		
		key = key.toUpperCase();
		
		if (key === 'ESCAPE') key = {'RU':'ЗАКРЫТЬ','EN':'CLOSE'}[this.lang];			
		if (key === 'ENTER') key = {'RU':'ОТПРАВИТЬ','EN':'SEND'}[this.lang];	
		if (key === 'BACKSPACE') key = '<';
		if (key === ' ') key = '_';
			
		var result = this.keyboard_layout.find(k => {
			return k[4] === key
		})
		
		if (result === undefined) return;
		this.pointerdown(null,result)
		
	},
	
	pointerdown : function(e, inp_key) {
		
		let key = -1;
		let key_x = 0;
		let key_y = 0;		
		
		if (e !== null) {
			
			let mx = e.data.global.x/app.stage.scale.x - objects.feedback_cont.x;
			let my = e.data.global.y/app.stage.scale.y - objects.feedback_cont.y;;

			let margin = 5;
			for (let k of this.keyboard_layout) {			
				if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin) {
					key = k[4];
					key_x = k[0];
					key_y = k[1];
					break;
				}
			}			
			
		} else {
			
			key = inp_key[4];
			key_x = inp_key[0];
			key_y = inp_key[1];			
		}
		
		
		
		//не нажата кнопка
		if (key === -1) return;			
				
		//подсвечиваем клавишу
		objects.hl_key.x = key_x - 10;
		objects.hl_key.y = key_y - 10;		
		objects.hl_key.texture = this.get_texture_for_key(key);
		anim2.add(objects.hl_key,{alpha:[1, 0]}, false, 0.5,'linear');
						
		if (key === '<') {
			objects.feedback_msg.text=objects.feedback_msg.text.slice(0, -1);
			key ='';
		}			
		
		
		if (key === 'EN' || key === 'RU') {
			this.set_keyboard_layout(key)
			return;	
		}	
		
		if (key === 'ЗАКРЫТЬ' || key === 'CLOSE') {
			this.close();
			this.p_resolve(['close','']);	
			key ='';
			sound.play('keypress');
			return;	
		}	
		
		if (key === 'ОТПРАВИТЬ' || key === 'SEND') {
			
			if (objects.feedback_msg.text === '') return;
			
			//если нашли ненормативную лексику то закрываем
			let mats = /шлю[хш]|п[еи]д[аеор]|суч?ка|г[ао]ндо|х[ую][ейяе]л?|жоп|соси|чмо|говн|дерьм|трах|секс|сосат|выеб|пизд|срал|уеб[аико]щ?|ебень?|ебу[ч]|ху[йия]|еба[нл]|дроч|еба[тш]|педик|[ъы]еба|ебну|ебл[ои]|ебись|сра[кч]|манда|еб[лн]я|ублюд|пис[юя]/i;
			let text_no_spaces = objects.feedback_msg.text.replace(/ /g,'');
			if (text_no_spaces.match(mats)) {
				this.close();
				this.p_resolve(['close','']);	
				key ='';
				return;
			}
			
			this.close();
			this.p_resolve(['sent',objects.feedback_msg.text]);	
			key ='';
			sound.play('keypress');
			return;	
		}	
		
		
		
		if (objects.feedback_msg.text.length >= this.MAX_SYMBOLS)  {
			sound.play('locked');
			return;			
		}
		
		if (key === '_') {
			objects.feedback_msg.text += ' ';	
			key ='';
		}			
		

		sound.play('keypress');
		
		objects.feedback_msg.text += key;	
		objects.feedback_control.text = `${objects.feedback_msg.text.length}/${this.MAX_SYMBOLS}`		
		
	}
	
}

main_menu= {

	activate: async function() {


		objects.bcg.width=800;
		objects.bcg.height=450;
		objects.bcg.x=400;
		objects.bcg.y=225;
		objects.bcg.tilePosition.y=400;
		objects.bcg.uvRespectAnchor = true;
		objects.bcg.anchor.set(0.5,0.5);
		objects.bcg.alpha=0.5;


		some_process.main_menu = this.process;
		anim2.add(objects.mb_cont,{x:[800,objects.mb_cont.sx]}, true, 1,'easeInOutCubic');
		anim2.add(objects.game_title,{y:[-300,objects.game_title.sy]}, true, 1,'easeInOutCubic');
		objects.desktop.texture = gres.desktop.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.6,'linear');
	},
	
	process : function() {

		//objects.bcg.tileScale.x+=0.001;

	},

	close : async function() {

		//some_process.main_menu = function(){};
		objects.mb_cont.visible=false;
		some_process.main_menu_process = function(){};
		anim2.add(objects.mb_cont,{x:[objects.mb_cont.x,800]}, true, 1,'easeInOutCubic');
		anim2.add(objects.game_title,{y:[objects.game_title.y,-300]}, true, 1,'linear');
		//await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.6,'linear');	
	},

	pb_down: async function () {

		if (anim2.any_on()===true || objects.id_cont.visible === true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		cards_menu.activate();

	},
	
	lb_button_down: async function () {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		lb.show();

	},

	rules_button_down: async function () {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
	
		await this.close();
		rules.activate();


	},

	chips_button_down : async function() {
		
		if (my_data.rating > 50) {
			
			let res = await confirm_dialog.show(['Получить фишки можно только если у вас их меньше 50. Хотите все равно посмотреть рекламу?','You can only get chips if you have less than 50 of them. Do you want to watch the ad anyway?'][LANG]);
			if (res === 'ok')	await ad.show2();			
			return;
		}
		
		let res = await confirm_dialog.show(['Получить 100 фишек за просмотр рекламы?','Get 100 chips (reward video)?'][LANG]);
		if (res === 'ok') {
			
			let res2 = await ad.show2();
			if (res2 !== 'err' || game_platform === 'GOOGLE_PLAY' || game_platform === 'DEBUG') {
				sound.play("confirm_dialog");
				table.update_balance(ME,100);				
			} else {
				sound.play('locked')
			}

		}
		
	},

	chat_button_down : async function() {
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		
		chat.activate();
		
		
	},

	rules_ok_down: function () {

		anim2.add(objects.rules_cont,{y:[objects.rules_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

}

chat = {
	
	last_record_end : 0,
	
	activate : function() {
		
		//firebase.database().ref('chat').remove();
		//return;		
		
		this.last_record_end = 0;
		objects.chat_records_cont.y = objects.chat_records_cont.sy;
		
		for(let rec of objects.chat_records) {
			rec.visible = false;			
			rec.msg_id = -1;	
			rec.tm=0;
		}
		
		objects.chat_cont.visible = true;
		//подписываемся на чат
		//подписываемся на изменения состояний пользователей
		firebase.database().ref('chat').once('value', snapshot => {chat.chat_load(snapshot.val());});		
		firebase.database().ref('chat').on('child_changed', snapshot => {chat.chat_updated(snapshot.val());});
	},
				
	get_oldest_record : function () {
		
		let oldest = objects.chat_records[0];
		
		for(let rec of objects.chat_records)
			if (rec.tm < oldest.tm)
				oldest = rec;			
		return oldest;

	},
		
	chat_load : async function(data) {
		
		if (data === null) return;
		
		data = Object.keys(data).map((key) => data[key]);
		data.sort(function(a, b) {	return a[3] - b[3];});
			
		for (let c = data.length - 13; c<data.length;c++)
			await this.chat_updated(data[c]);			
		
	},	
		
	chat_updated : async function(data) {		
		
		console.log(data);
		
		var result = objects.chat_records.find(obj => {
		  return obj.msg_id === data[4];
		})
		
		if (result !== undefined) {			
			//result.tm = data[3];
			return;
		};
		
		let rec = this.get_oldest_record();
		
		//сразу заносим айди чтобы проверять
		rec.msg_id = data[4];
		
		rec.y = this.last_record_end;
		
		await rec.set(...data)		
		
		this.last_record_end += 35;		
		
		objects.chat_records_cont.y-=35

		//anim2.add(objects.chat_records_cont,{y:[objects.chat_records_cont.y, objects.chat_records_cont.y-35]}, true, 0.25,'easeInOutCubic');		
		
	},
	
	wheel_event : function(delta) {
		
		//objects.chat_records_cont.y-=delta*5;
		
		
	},
	
	close : function() {
		
		objects.chat_cont.visible = false;
		firebase.database().ref('chat').off();
		if (objects.feedback_cont.visible === true)
			feedback.close();
	},
	
	close_down : async function() {
		
		sound.play('click');
		this.close();
		main_menu.activate();
		

		
	},
	
	open_keyboard : async function() {
		
		//пишем отзыв и отправляем его		
		sound.play('click');
		let fb = await feedback.show(opp_data.uid);		
		if (fb[0] === 'sent') {
			
			await firebase.database().ref('chat/'+irnd(1,50)).set([ my_data.uid, my_data.name, fb[1], firebase.database.ServerValue.TIMESTAMP, irnd(0,9999999)]);
		
		}		
		
	}

	
}

lb = {
	
	active : 0,
	cards_pos: [[370,10],[380,70],[390,130],[380,190],[360,250],[330,310],[290,370]],

	show: function() {

		this.active = 1;
		objects.desktop.visible=true;
		objects.desktop.texture=game_res.resources.lb_bcg.texture;

		
		anim2.add(objects.leader_header,{y:[-50, objects.leader_header.sy]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_1_cont,{x:[-150, objects.lb_1_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_2_cont,{x:[-150, objects.lb_2_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_3_cont,{x:[-150, objects.lb_3_cont.sx]}, true, 0.5,'easeOutBack');
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.lb_back_button,{x:[800, objects.lb_back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 1,'linear');			


		for (let i=0;i<7;i++) {
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];
			objects.lb_cards[i].place.text=(i+4)+".";

		}


		this.update();

	},

	close: async function() {

		this.active = 0;
		anim2.add(objects.leader_header,{y:[objects.leader_header.y,-50]}, true, 0.5,'easeInBack');
		anim2.add(objects.lb_1_cont,{x:[objects.lb_1_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_2_cont,{x:[objects.lb_2_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_3_cont,{x:[objects.lb_3_cont.x,-150]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_cards_cont,{x:[objects.lb_cards_cont.x, 450]}, false, 0.5,'easeInBack');
		anim2.add(objects.lb_back_button,{x:[objects.lb_back_button.x, 800]}, false, 0.5,'easeInBack');
		await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.6,'linear');		

	},

	back_button_down: async function() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
		await this.close();
		main_menu.activate();

	},

	update: function () {

		firebase.database().ref("players").orderByChild('rating').limitToLast(25).once('value').then((snapshot) => {

			if (snapshot.val()===null) {
			  //console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {

				var players_array = [];
				snapshot.forEach(players_data=> {
					if (players_data.val().name!=="" && players_data.val().name!=='')
						players_array.push([players_data.val().name, players_data.val().rating, players_data.val().pic_url]);
				});


				players_array.sort(function(a, b) {	return b[1] - a[1];});

				//создаем загрузчик топа
				var loader = new PIXI.Loader();

				var len=Math.min(10,players_array.length);

				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					if (players_array[i]!== undefined) {						
						make_text(objects['lb_'+(i+1)+'_name'],players_array[i][0],180);					
						objects['lb_'+(i+1)+'_rating'].text=players_array[i][1];
						loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});						
					}
				};

				//загружаем остальных
				for (let i=3;i<10;i++) {
					if (players_array[i]!== undefined) {
						
						let fname=players_array[i][0];
						make_text(objects.lb_cards[i-3].name,fname,180);
						objects.lb_cards[i-3].rating.text=players_array[i][1];
						loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});						
					} 
				};

				loader.load();

				//показываем аватар как только он загрузился
				loader.onProgress.add((loader, resource) => {
					let lb_num=Number(resource.name.slice(-1));
					if (lb_num<3)
						objects['lb_'+(lb_num+1)+'_avatar'].texture=resource.texture
					else
						objects.lb_cards[lb_num-3].avatar.texture=resource.texture;
				});

			}

		});

	}

}

rules = {
	
	active : 0,
	
	activate : function() {
		
		this.active = 1;
		anim2.add(objects.desktop,{alpha:[0,0.5]}, true, 0.6,'linear');	
		anim2.add(objects.rules_back_button,{x:[800, objects.rules_back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.rules_text,{alpha:[0, 1]}, true, 1,'linear');
				
		objects.rules_text.text = ['Добро пожаловать в карточную игру Покер (онлайн дуэль)!\n\nВ игре участвуют 2 игрока. Цель игры - составить лучшую пятикарточную покерную комбинацию из своих и общих карт. В игре несколько раундов, в течении которых игроки делают ставки. После каждого раунда открывается одна или три (на префлопе) карты. Когда все карты открыты, объявляется победитель - тот, у кого сложилась более сильная комбинация карт, и он забирает банк (pot). Также можно выиграть банк если соперник откажется продолжать партию (скинет карты). Выиграть можно также вводя соперника в заблуждение величиной ставок (блеф) и тем самым заставляя его скидывать карты.\n\nУдачной игры!','Welcome to the Poker card game (Heads Up)!\n\n The game involves 2 players. The goal of the game is to make the best five-card poker combination of your own and community cards. There are several rounds in the game, during which players place bets. After each round, one or three (preflop) cards are opened. When all the cards are open, the winner is announced - the one who has a stronger combination of cards, and he takes the pot. You can also win the pot if the opponent refuses to continue the game (throws off the cards). You can also win by misleading your opponent with the amount of bets (bluff) and thereby forcing him to fold his cards.\n\nHave a good game!'][LANG];
	},
	
	back_button_down : async function() {
		
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};
		
		
		sound.play('click');
		await this.close();
		main_menu.activate();
		
	},
	
	close : async function() {
		
		this.active = 0;
		anim2.add(objects.rules_text,{alpha:[1, 0]}, false, 0.5,'linear');
		anim2.add(objects.desktop,{alpha:[1, 0]}, false, 0.5,'linear');
		await anim2.add(objects.rules_back_button,{x:[objects.rules_back_button.x, 800]}, false, 0.5,'easeInCubic');
		
		
	}	
	
	
}

stickers={
	
	promise_resolve_send :0,
	promise_resolve_recive :0,

	show_panel: function() {

		
		if (objects.big_message_cont.visible === true || objects.req_cont.visible === true || objects.stickers_cont.ready===false) {
			return;			
		}



		//ничего не делаем если панель еще не готова
		if (objects.stickers_cont.ready===false || objects.stickers_cont.visible===true || state!=="p")
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[450, objects.stickers_cont.sy]}, true, 0.5,'easeOutBack');

	},

	hide_panel: function() {

		//game_res.resources.close.sound.play();

		if (objects.stickers_cont.ready===false)
			return;

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[objects.stickers_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

	send : async function(id) {

		if (objects.big_message_cont.visible === true || objects.req_cont.visible === true || objects.stickers_cont.ready===false) {
			return;			
		}
		
		if (this.promise_resolve_send!==0)
			this.promise_resolve_send("forced");

		this.hide_panel();

		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MSG",tm:Date.now(),data:id});
		message.add(['Стикер отправлен сопернику','Sticker was sent to the opponent'][LANG]);

		//показываем какой стикер мы отправили
		objects.sent_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
		
		await anim2.add(objects.sent_sticker_area,{alpha:[0, 0.5]}, true, 0.5,'linear');
		
		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_send = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		await anim2.add(objects.sent_sticker_area,{alpha:[0.5, 0]}, false, 0.5,'linear');
	},

	receive: async function(id) {

		
		if (this.promise_resolve_recive!==0)
			this.promise_resolve_recive("forced");

		//воспроизводим соответствующий звук
		//game_res.resources.receive_sticker.sound.play();

		objects.rec_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
	
		await anim2.add(objects.rec_sticker_area,{x:[-150, objects.rec_sticker_area.sx]}, true, 0.5,'easeOutBack');

		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_recive = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		anim2.add(objects.rec_sticker_area,{x:[objects.rec_sticker_area.sx, -150]}, false, 0.5,'easeInBack');

	}

}

cards_menu={
	
	state_tint :{},
	_opp_data : {},
	pover : 0,
	uid_pic_url_cache : {},
	
	cards_pos: [
				[0,0],[0,90],[0,180],[0,270],
				[190,0],[190,90],[190,180],[190,270],
				[380,0],[380,90],[380,180],[380,270],
				[570,0],[570,90],[570,180]

				],

	activate: function () {



		objects.desktop.texture=game_res.resources.cards_bcg.texture;
		anim2.add(objects.cards_cont,{alpha:[0,1]}, true, 0.4,'linear');		
		anim2.add(objects.back_button,{x:[800, objects.back_button.sx]}, true, 0.5,'easeOutCubic');
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.4,'linear');

		//расставляем по соответствующим координатам
		for(let i=0;i<15;i++) {
			objects.mini_cards[i].x=this.cards_pos[i][0];
			objects.mini_cards[i].y=this.cards_pos[i][1];
		}


		//отключаем все карточки
		this.card_i=1;
		for(let i=1;i<15;i++)
			objects.mini_cards[i].visible=false;

		//добавляем карточку ии
		this.add_card_ai();

		//включаем сколько игроков онлайн
		anim2.add(objects.players_online,{y:[500,objects.players_online.sy],x:[0,objects.players_online.sx]}, true, 0.6,'linear');		
		anim2.add(objects.cards_menu_header,{y:[-50,objects.cards_menu_header.sy],x:[0,objects.cards_menu_header.sx]}, true, 0.6,'linear');	
		
		//подписываемся на изменения состояний пользователей
		firebase.database().ref(room_name) .on('value', (snapshot) => {cards_menu.players_list_updated(snapshot.val());});

	},

	players_list_updated: function(players) {

		//если мы в игре то не обновляем карточки
		if (state==="p" || state==="b")
			return;


		//это столы
		let tables = {};
		
		//это свободные игроки
		let single = {};


		//делаем дополнительный объект с игроками и расширяем id соперника
		let p_data = JSON.parse(JSON.stringify(players));
		
		//создаем массив свободных игроков
		for (let uid in players){			
			if (players[uid].state !== 'p' && players[uid].hidden === 0)
				single[uid] = players[uid].name;						
		}
		
		//console.table(single);
		
		//убираем не играющие состояние
		for (let uid in p_data)
			if (p_data[uid].state !== 'p')
				delete p_data[uid];
		
		
		//дополняем полными ид оппонента
		for (let uid in p_data) {			
			let small_opp_id = p_data[uid].opp_id;			
			//проходимся по соперникам
			for (let uid2 in players) {	
				let s_id=uid2.substring(0,10);				
				if (small_opp_id === s_id) {
					//дополняем полным id
					p_data[uid].opp_id = uid2;
				}							
			}			
		}
				
		
		//определяем столы
		//console.log (`--------------------------------------------------`)
		for (let uid in p_data) {
			let opp_id = p_data[uid].opp_id;
			let name1 = p_data[uid].name;
			let rating = p_data[uid].rating;
			let hid = p_data[uid].hidden;
			
			if (p_data[opp_id] !== undefined) {
				
				if (uid === p_data[opp_id].opp_id && tables[uid] === undefined) {
					
					tables[uid] = opp_id;					
					//console.log(`${name1} (Hid:${hid}) (${rating}) vs ${p_data[opp_id].name} (Hid:${p_data[opp_id].hidden}) (${p_data[opp_id].rating}) `)	
					delete p_data[opp_id];				
				}
				
			} else 
			{				
				//console.log(`${name1} (${rating}) - одиночка `)					
			}			
		}
					
		
		
		//считаем и показываем количество онлайн игрокова
		let num = 0;
		for (let uid in players)
			if (players[uid].hidden===0)
				num++
			
		objects.players_online.text=['Игроков онлайн: ','Players online: '][LANG] + num + ['     ( комната: ','     ( room: '][LANG] + room_name +' )';
		
		
		//считаем сколько одиночных игроков и сколько столов
		let num_of_single = Object.keys(single).length;
		let num_of_tables = Object.keys(tables).length;
		let num_of_cards = num_of_single + num_of_tables;
		
		//если карточек слишком много то убираем столы
		if (num_of_cards > 14) {
			let num_of_tables_cut = num_of_tables - (num_of_cards - 14);			
			
			let num_of_tables_to_cut = num_of_tables - num_of_tables_cut;
			
			//удаляем столы которые не помещаются
			let t_keys = Object.keys(tables);
			for (let i = 0 ; i < num_of_tables_to_cut ; i++) {
				delete tables[t_keys[i]];
			}
		}

		
		//убираем карточки пропавших игроков и обновляем карточки оставшихся
		for(let i=1;i<15;i++) {			
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {				
				let card_uid = objects.mini_cards[i].uid;				
				if (single[card_uid] === undefined)					
					objects.mini_cards[i].visible = false;
				else
					this.update_existing_card({id:i, state:players[card_uid].state , rating:players[card_uid].rating});
			}
		}



		
		//определяем новых игроков которых нужно добавить
		new_single = {};		
		
		for (let p in single) {
			
			let found = 0;
			for(let i=1;i<15;i++) {			
			
				if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'single') {					
					if (p ===  objects.mini_cards[i].uid) {
						
						found = 1;							
					}	
				}				
			}		
			
			if (found === 0)
				new_single[p] = single[p];
		}
		

		
		//убираем исчезнувшие столы (если их нет в новом перечне) и оставляем новые
		for(let i=1;i<15;i++) {			
		
			if (objects.mini_cards[i].visible === true && objects.mini_cards[i].type === 'table') {
				
				let uid1 = objects.mini_cards[i].uid1;	
				let uid2 = objects.mini_cards[i].uid2;	
				
				let found = 0;
				
				for (let t in tables) {
					
					let t_uid1 = t;
					let t_uid2 = tables[t];				
					
					if (uid1 === t_uid1 && uid2 === t_uid2) {
						delete tables[t];
						found = 1;						
					}							
				}
								
				if (found === 0)
					objects.mini_cards[i].visible = false;
			}	
		}
		
		
		//размещаем на свободных ячейках новых игроков
		for (let uid in new_single)			
			this.place_new_card({uid:uid, state:players[uid].state, name : players[uid].name,  rating : players[uid].rating});

		//размещаем новые столы сколько свободно
		for (let uid in tables) {			
			let n1=players[uid].name
			let n2=players[tables[uid]].name
			
			let r1= players[uid].rating
			let r2= players[tables[uid]].rating
			this.place_table({uid1:uid,uid2:tables[uid],name1: n1, name2: n2, rating1: r1, rating2: r2});
		}
		
	},

	get_state_tint: function(s) {

		switch(s) {

			case "o":
				return this.state_tint.o;
			break;

			case "b":
				return this.state_tint.b;
			break;

			case "p":
				return this.state_tint.p;
			break;
			
			case "bot":
				return this.state_tint.bot;
			break;

		}
	},

	place_table : function (params={uid1:0,uid2:0,name1: "XXX",name2: "XXX", rating1: 1400, rating2: 1400}) {
				
		for(let i=1;i<15;i++) {

			//это если есть вакантная карточка
			if (objects.mini_cards[i].visible===false) {

				//устанавливаем цвет карточки в зависимости от состояния
				objects.mini_cards[i].bcg.tint=this.get_state_tint(params.state);
				objects.mini_cards[i].state=params.state;

				objects.mini_cards[i].type = "table";
				
				
				objects.mini_cards[i].bcg.texture = gres.mini_player_card_table.texture;
				objects.mini_cards[i].bcg.tint=this.get_state_tint('p');
				
				//присваиваем карточке данные
				//objects.mini_cards[i].uid=params.uid;
				objects.mini_cards[i].uid1=params.uid1;
				objects.mini_cards[i].uid2=params.uid2;
												
				//убираем элементы свободного стола
				objects.mini_cards[i].rating_text.visible = false;
				objects.mini_cards[i].avatar.visible = false;
				objects.mini_cards[i].name_text.visible = false;

				//Включаем элементы стола 
				objects.mini_cards[i].rating_text1.visible = true;
				objects.mini_cards[i].rating_text2.visible = true;
				objects.mini_cards[i].avatar1.visible = true;
				objects.mini_cards[i].avatar2.visible = true;
				objects.mini_cards[i].rating_bcg.visible = true;

				objects.mini_cards[i].rating_text1.text = params.rating1;
				objects.mini_cards[i].rating_text2.text = params.rating2;
				
				objects.mini_cards[i].name1 = params.name1;
				objects.mini_cards[i].name2 = params.name2;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid1, tar_obj:objects.mini_cards[i].avatar1});
				
				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid2, tar_obj:objects.mini_cards[i].avatar2});


				objects.mini_cards[i].visible=true;


				break;
			}
		}
		
	},

	update_existing_card: function(params={id:0, state:"o" , rating:1400}) {

		//устанавливаем цвет карточки в зависимости от состояния(имя и аватар не поменялись)
		objects.mini_cards[params.id].bcg.tint=this.get_state_tint(params.state);
		objects.mini_cards[params.id].state=params.state;

		objects.mini_cards[params.id].rating=params.rating;
		objects.mini_cards[params.id].rating_text.text=params.rating;
		objects.mini_cards[params.id].visible=true;
	},

	place_new_card: function(params={uid:0, state: "o", name: "XXX", rating: rating}) {

		for(let i=1;i<15;i++) {

			//это если есть вакантная карточка
			if (objects.mini_cards[i].visible===false) {

				//устанавливаем цвет карточки в зависимости от состояния
				objects.mini_cards[i].bcg.texture = gres.mini_player_card.texture;
				objects.mini_cards[i].bcg.tint=this.get_state_tint(params.state);
				objects.mini_cards[i].state=params.state;

				objects.mini_cards[i].type = "single";

				//присваиваем карточке данные
				objects.mini_cards[i].uid=params.uid;

				//убираем элементы стола так как они не нужны
				objects.mini_cards[i].rating_text1.visible = false;
				objects.mini_cards[i].rating_text2.visible = false;
				objects.mini_cards[i].avatar1.visible = false;
				objects.mini_cards[i].avatar2.visible = false;
				objects.mini_cards[i].rating_bcg.visible = false;
				
				//включаем элементы свободного стола
				objects.mini_cards[i].rating_text.visible = true;
				objects.mini_cards[i].avatar.visible = true;
				objects.mini_cards[i].name_text.visible = true;

				objects.mini_cards[i].name=params.name;
				make_text(objects.mini_cards[i].name_text,params.name,110);
				objects.mini_cards[i].rating=params.rating;
				objects.mini_cards[i].rating_text.text=params.rating;

				objects.mini_cards[i].visible=true;

				//стираем старые данные
				objects.mini_cards[i].avatar.texture=PIXI.Texture.EMPTY;

				//получаем аватар и загружаем его
				this.load_avatar2({uid:params.uid, tar_obj:objects.mini_cards[i].avatar});

				//console.log(`новая карточка ${i} ${params.uid}`)
				break;
			}
		}

	},

	get_texture : function (pic_url) {
		
		return new Promise((resolve,reject)=>{
			
			//меняем адрес который невозможно загрузить
			if (pic_url==="https://vk.com/images/camera_100.png")
				pic_url = "https://i.ibb.co/fpZ8tg2/vk.jpg";

			//сначала смотрим на загруженные аватарки в кэше
			if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {

				//загружаем аватарку игрока
				//console.log(`Загружаем url из интернети или кэша браузера ${pic_url}`)	
				let loader=new PIXI.Loader();
				loader.add("pic", pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
				loader.load(function(l,r) {	resolve(l.resources.pic.texture)});
			}
			else
			{
				//загружаем текустуру из кэша
				//console.log(`Текстура взята из кэша ${pic_url}`)	
				resolve (PIXI.utils.TextureCache[pic_url]);
			}
		})
		
	},
	
	get_uid_pic_url : function (uid) {
		
		return new Promise((resolve,reject)=>{
						
			//проверяем есть ли у этого id назначенная pic_url
			if (this.uid_pic_url_cache[uid] !== undefined) {
				//console.log(`Взяли pic_url из кэша ${this.uid_pic_url_cache[uid]}`);
				resolve(this.uid_pic_url_cache[uid]);		
				return;
			}

							
			//получаем pic_url из фб
			firebase.database().ref("players/" + uid + "/pic_url").once('value').then((res) => {

				pic_url=res.val();
				
				if (pic_url === null) {
					
					//загрузить не получилось поэтому возвращаем случайную картинку
					resolve('https://avatars.dicebear.com/v2/male/'+irnd(10,10000)+'.svg');
				}
				else {
					
					//добавляем полученный pic_url в кэш
					//console.log(`Получили pic_url из ФБ ${pic_url}`)	
					this.uid_pic_url_cache[uid] = pic_url;
					resolve (pic_url);
				}
				
			});		
		})
		
	},
	
	load_avatar2 : function (params = {uid : 0, tar_obj : 0, card_id : 0}) {
		
		//получаем pic_url
		this.get_uid_pic_url(params.uid).then(pic_url => {
			return this.get_texture(pic_url);
		}).then(t=>{			
			params.tar_obj.texture=t;			
		})	
	},

	add_card_ai: function() {

		//убираем элементы стола так как они не нужны
		objects.mini_cards[0].rating_text1.visible = false;
		objects.mini_cards[0].rating_text2.visible = false;
		objects.mini_cards[0].avatar1.visible = false;
		objects.mini_cards[0].avatar2.visible = false;
		objects.mini_cards[0].rating_bcg.visible = false;

		objects.mini_cards[0].bcg.tint=this.state_tint.bot;
		objects.mini_cards[0].visible=true;
		objects.mini_cards[0].uid="BOT";
		objects.mini_cards[0].name=objects.mini_cards[0].name_text.text=['Джокер','Joker'][LANG];

		objects.mini_cards[0].rating=100;		
		objects.mini_cards[0].rating_text.text = objects.mini_cards[0].rating;
		objects.mini_cards[0].avatar.texture=game_res.resources.pc_icon.texture;
	},
	
	card_down : function ( card_id ) {
		
		if (objects.mini_cards[card_id].type === 'single')
			this.show_invite_dialog(card_id);
		
		if (objects.mini_cards[card_id].type === 'table')
			this.show_table_dialog(card_id);
				
	},
	
	show_table_dialog : function (card_id) {
		
		if (anim2.any_on === true) {
			sound.play('locked');
			return
		};

		
		anim2.add(objects.td_cont,{y:[-150, objects.td_cont.sy]}, true, 0.5,'easeOutBack');
		
		objects.td_avatar1.texture = objects.mini_cards[card_id].avatar1.texture;
		objects.td_avatar2.texture = objects.mini_cards[card_id].avatar2.texture;
		
		objects.td_rating1.text = objects.mini_cards[card_id].rating_text1.text;
		objects.td_rating2.text = objects.mini_cards[card_id].rating_text2.text;
		
		make_text(objects.td_name1, objects.mini_cards[card_id].name1, 150);
		make_text(objects.td_name2, objects.mini_cards[card_id].name2, 150);
		
	},
	
	close_table_dialog : function () {
		
		sound.play('close');
		
		anim2.add(objects.td_cont,{y:[objects.td_cont.sy, 400]}, false, 0.5,'easeInBack');

		
	},

	show_invite_dialog: function(card_id) {

		if (anim2.any_on() === true || objects.invite_cont.visible === true) {
			sound.play('locked');
			return
		};

		pending_player="";

		sound.play('click');
			

		//показыаем кнопку приглашения
		objects.invite_button.texture=game_res.resources.invite_button.texture;
	
		anim2.add(objects.invite_cont,{x:[800, objects.invite_cont.sx]}, true, 0.15,'linear');
		anim2.add(objects.cards_menu_header,{x:[objects.cards_menu_header.sx,230]}, true, 0.15,'linear');
		anim2.add(objects.players_online,{x:[objects.players_online.sx,230]}, true, 0.15,'linear');
		
		//копируем предварительные данные
		cards_menu._opp_data = {uid:objects.mini_cards[card_id].uid,name:objects.mini_cards[card_id].name,rating:objects.mini_cards[card_id].rating};
		
		
		objects.invite_button_title.text=['Пригласить','Send invite'][LANG];

		let invite_available = 	cards_menu._opp_data.uid !== my_data.uid;
		invite_available=invite_available && (objects.mini_cards[card_id].state==="o" || objects.mini_cards[card_id].state==="b");
		invite_available=invite_available || cards_menu._opp_data.uid==="BOT";
		invite_available=invite_available && cards_menu._opp_data.rating >= 50 && my_data.rating >= 50;

		//показыаем кнопку приглашения только если это допустимо
		objects.invite_button.visible=objects.invite_button_title.visible=invite_available;

		//заполняем карточу приглашения данными
		objects.invite_avatar.texture=objects.mini_cards[card_id].avatar.texture;
		make_text(objects.invite_name,cards_menu._opp_data.name,230);
		objects.invite_rating.text=objects.mini_cards[card_id].rating_text.text;

	},

	close: async function() {


		if (objects.invite_cont.visible === true)
			this.hide_invite_dialog();
		
		if (objects.td_cont.visible === true)
			this.close_table_dialog();

		//плавно все убираем
		anim2.add(objects.cards_menu_header,{y:[ objects.cards_menu_header.y, -50]}, false, 0.4,'easeInCubic');
		anim2.add(objects.cards_cont,{alpha:[1,0]}, false, 0.4,'linear');		
		anim2.add(objects.back_button,{x:[objects.back_button.sx, 800]}, false, 0.5,'easeInCubic');
		anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.4,'linear');
		await anim2.add(objects.players_online,{y:[objects.players_online.y, 470]}, false, 0.5,'easeInCubic');

		//больше ни ждем ответ ни от кого
		pending_player="";
		

		//подписываемся на изменения состояний пользователей
		firebase.database().ref(room_name).off();

	},
	
	wheel_event: function(dir) {
		
		if (this.pover === 0) return;
		
		if (dir === 1)
			this.fb_down_down();
		else
			this.fb_up_down();
		
	},
	
	hide_invite_dialog: function() {

		sound.play('close');

		if (objects.invite_cont.visible===false)
			return;

		//отправляем сообщение что мы уже не заинтересованы в игре
		if (pending_player!=="") {
			firebase.database().ref("inbox/"+pending_player).set({sender:my_data.uid,message:"INV_REM",tm:Date.now()});
			pending_player="";
		}


		anim2.add(objects.invite_cont,{x:[objects.invite_cont.x, 800]}, false, 0.15,'linear');
		anim2.add(objects.cards_menu_header,{x:[230,objects.cards_menu_header.sx]}, true, 0.15,'linear');
		anim2.add(objects.players_online,{x:[230,objects.players_online.sx]}, true, 0.15,'linear');

	},

	send_invite: async function() {


		if (objects.invite_cont.ready===false || objects.invite_cont.visible===false)
			return;

		if (anim2.any_on() === true) {
			sound.play('locked');
			return
		};

		if (cards_menu._opp_data.uid==="BOT")
		{
			await this.close();
			
			//заполняем данные бот-оппонента
			opp_data.rating=999;
			make_text(objects.opp_card_name,cards_menu._opp_data.name,160);
			objects.opp_card_rating.text=opp_data.rating;
			objects.opp_avatar.texture=objects.invite_avatar.texture;			
			game.activate(ME, sp_game);
		}
		else
		{
			sound.play('click');
			objects.invite_button_title.text=['Ждите ответ..','Waiting...'][LANG];
			firebase.database().ref("inbox/"+cards_menu._opp_data.uid).set({sender:my_data.uid,message:"INV",tm:Date.now()});
			pending_player=cards_menu._opp_data.uid;

		}

	},

	rejected_invite: function() {

		pending_player="";
		cards_menu._opp_data={};
		this.hide_invite_dialog();
		big_message.show("Соперник отказался от игры",0);

	},

	accepted_invite: async function(seed) {

		//убираем запрос на игру если он открыт
		req_dialog.hide();
		
		//устанаваем окончательные данные оппонента
		opp_data=cards_menu._opp_data;
		
		//сразу карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,160);
		objects.opp_card_rating.text=opp_data.rating;
		objects.opp_avatar.texture=objects.invite_avatar.texture;		

		//закрываем меню и начинаем игру
		await cards_menu.close();
		game.activate(OPP, mp_game);
	},

	back_button_down: async function() {

		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		main_menu.activate();

	}

}

auth2 = {
		
	load_script : function(src) {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
			
	get_random_char : function() {		
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		return chars[irnd(0,chars.length-1)];
		
	},
	
	get_random_uid_for_local : function(prefix) {
		
		let uid = prefix;
		for ( let c = 0 ; c < 12 ; c++ )
			uid += this.get_random_char();
		
		//сохраняем этот uid в локальном хранилище
		try {
			localStorage.setItem('poker_uid', uid);
		} catch (e) {alert(e)}
					
		return uid;
		
	},
	
	get_random_name : function(uid) {
		
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const rnd_names = ['Gamma','Chime','Dron','Perl','Onyx','Asti','Wolf','Roll','Lime','Cosy','Hot','Kent','Pony','Baker','Super','ZigZag','Magik','Alpha','Beta','Foxy','Fazer','King','Kid','Rock'];
		
		if (uid !== undefined) {
			
			let e_num1 = chars.indexOf(uid[3]) + chars.indexOf(uid[4]) + chars.indexOf(uid[5]) + chars.indexOf(uid[6]);
			e_num1 = Math.abs(e_num1) % (rnd_names.length - 1);				
			let name_postfix = chars.indexOf(uid[7]).toString() + chars.indexOf(uid[8]).toString() + chars.indexOf(uid[9]).toString() ;	
			return rnd_names[e_num1] + name_postfix.substring(0, 3);					
			
		} else {

			let rnd_num = irnd(0, rnd_names.length - 1);
			let rand_uid = irnd(0, 999999)+ 100;
			let name_postfix = rand_uid.toString().substring(0, 3);
			let name =	rnd_names[rnd_num] + name_postfix;				
			return name;
		}	
	},	
	
	get_country_code : async function() {
		
		let country_code = ''
		try {
			let resp1 = await fetch("https://ipinfo.io/json");
			let resp2 = await resp1.json();			
			country_code = resp2.country;			
		} catch(e){}

		return country_code;
		
	},
	
	search_in_local_storage : function() {
		
		//ищем в локальном хранилище
		let local_uid = null;
		
		try {
			local_uid = localStorage.getItem('poker_uid');
		} catch (e) {alert(e)}
				
		if (local_uid !== null) return local_uid;
		
		return undefined;	
		
	},
	
	init : async function() {	
				
		if (game_platform === 'GM') {
			
			try {await this.load_script('https://api.gamemonetize.com/sdk.js')} catch (e) {alert(e)};
			
			window.SDK_OPTIONS = {
				gameId: "itlfj6x5pluki04lefb9z3n73xedj19x",
				onEvent: function (a) {
					switch (a.name) {
						case "SDK_GAME_PAUSE":
						   // pause game logic / mute audio
						   break;
						case "SDK_GAME_START":
						   // advertisement done, resume game logic and unmute audio
						   break;
						case "SDK_READY":
						   // when sdk is ready
						   break;
					}
				}
			
			}
			
			let country_code = await this.get_country_code();
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GM_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			
		}
				
		if (game_platform === 'YANDEX') {			
		
			try {await this.load_script('https://yandex.ru/games/sdk/v2')} catch (e) {alert(e)};										
					
			let _player;
			
			try {
				window.ysdk = await YaGames.init({});			
				_player = await window.ysdk.getPlayer();
			} catch (e) { alert(e)};
			
			my_data.uid = _player.getUniqueID().replace(/[\/+=]/g, '');
			my_data.name = _player.getName();
			my_data.pic_url = _player.getPhoto('medium');
			
			if (my_data.pic_url === 'https://games-sdk.yandex.ru/games/api/sdk/v1/player/avatar/0/islands-retina-medium')
				my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';
			
			if (my_data.name === '')
				my_data.name = this.get_random_name(my_data.uid);
			
			//если английский яндекс до добавляем к имени страну
			let country_code = await this.get_country_code();
			my_data.name = my_data.name + ' (' + country_code + ')';			


			
			return;
		}
		
		if (game_platform === 'VK') {
			
			try {await this.load_script('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')} catch (e) {alert(e)};
			
			let _player;
			
			try {
				await vkBridge.send('VKWebAppInit');
				_player = await vkBridge.send('VKWebAppGetUserInfo');				
			} catch (e) {alert(e)};

			
			my_data.name 	= _player.first_name + ' ' + _player.last_name;
			my_data.uid 	= "vk"+_player.id;
			my_data.pic_url = _player.photo_100;
			
			return;
			
		}
		
		if (game_platform === 'GOOGLE_PLAY') {	

			let country_code = await this.get_country_code();
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			return;
		}
		
		if (game_platform === 'DEBUG') {		

			my_data.name = my_data.uid = 'debug' + prompt('Отладка. Введите ID', 100);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';		
			return;
		}
		
		if (game_platform === 'CRAZYGAMES') {
			
			let country_code = await this.get_country_code();
			try {await this.load_script('https://sdk.crazygames.com/crazygames-sdk-v1.js')} catch (e) {alert(e)};			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('CG_');
			my_data.name = this.get_random_name(my_data.uid) + ' (' + country_code + ')';
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
			let crazysdk = window.CrazyGames.CrazySDK.getInstance();
			crazysdk.init();			
			return;
		}
		
		if (game_platform === 'UNKNOWN') {
			
			//если не нашли платформу
			alert('Неизвестная платформа. Кто Вы?')
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('LS_');
			my_data.name = this.get_random_name(my_data.uid);
			my_data.pic_url = 'https://avatars.dicebear.com/api/adventurer/' + my_data.uid + '.svg';	
		}
	
		
	
	}
	
}

function resize() {
	
    const vpw = window.innerWidth;  // Width of the viewport
    const vph = window.innerHeight; // Height of the viewport
    let nvw; // New game width
    let nvh; // New game height

    if (vph / vpw < M_HEIGHT / M_WIDTH) {
      nvh = vph;
      nvw = (nvh * M_WIDTH) / M_HEIGHT;
    } else {
      nvw = vpw;
      nvh = (nvw * M_HEIGHT) / M_WIDTH;
    }
    app.renderer.resize(nvw, nvh);
    app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
}

function set_state(params) {

	if (params.state!==undefined)
		state=params.state;

	if (params.hidden!==undefined)
		h_state=+params.hidden;

	let small_opp_id="";
	if (opp_data.uid!==undefined)
		small_opp_id=opp_data.uid.substring(0,10);

	let rating_to_show = my_data.rating;
	if (sp_game.on === 1)
		rating_to_show = sp_game.true_rating;

	firebase.database().ref(room_name+"/"+my_data.uid).set({state:state, name:my_data.name, rating : rating_to_show, hidden:h_state, opp_id : small_opp_id});

}

function vis_change() {

		if (document.hidden === true)		
			hidden_state_start = Date.now();			
		
		set_state({hidden : document.hidden});
		
}

async function load_resources() {

	//это нужно удалить потом
	/*document.body.innerHTML = "Привет!\nДобавляем в игру некоторые улучшения))\nЗайдите через 40 минут.";
	document.body.style.fontSize="24px";
	document.body.style.color = "red";
	return;*/

	document.getElementById("m_progress").style.display = 'flex';

	let git_src="https://akukamil.github.io/duel2/"
	//git_src=""

	//подпапка с ресурсами
	let lang_pack = ['RUS','ENG'][LANG];
	
	game_res=new PIXI.Loader();
	
	
	game_res.add("m2_font", git_src+"fonts/MS_Comic_Sans/font.fnt");

	game_res.add('receive_sticker',git_src+'sounds/receive_sticker.mp3');
	game_res.add('message',git_src+'sounds/message.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('win',git_src+'sounds/win.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('clock',git_src+'sounds/clock.mp3');
	game_res.add('card',git_src+'sounds/card2.mp3');
	game_res.add('card_take',git_src+'sounds/card.mp3');
	game_res.add('confirm_dialog',git_src+'sounds/confirm_dialog.mp3');
	game_res.add('move',git_src+'sounds/move.mp3');
	game_res.add('done',git_src+'sounds/done.mp3');
	game_res.add('razdacha',git_src+'sounds/razdacha.mp3');
	game_res.add('card_open',git_src+'sounds/card_open.mp3');
	game_res.add('inc_card',git_src+'sounds/inc_card.mp3');
	game_res.add('take',git_src+'sounds/take.mp3');
	game_res.add('dialog',git_src+'sounds/dialog.mp3');
	game_res.add('plus_minus_bet',git_src+'sounds/plus_minus_bet.mp3');
	game_res.add('keypress',git_src+'sounds/keypress.mp3');
	
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++) {
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+'res/'+lang_pack + '/' + load_list[i].name + "." +  load_list[i].image_format);
        if (load_list[i].class === "asprite" )
            game_res.add(load_list[i].name, git_src+"gifs/" + load_list[i].res_name);
	}


	//вручную добавляем скины так как они на отдельном листе
	const skins_prefixes = ['zz','s0'];
	const limb_names = ['spine','left_arm1','left_arm2','right_arm1','right_arm2','left_leg1','left_leg2','right_leg1','right_leg2','projectile'];
	for(let s of skins_prefixes)
		for (let l of limb_names)
			game_res.add(s +'_' + l, git_src+'res/SKINS/' + s + '_' + l + ".png");

	//это файл с анимациями который нужно оптимизировать потом
	game_res.add("skl_prepare", git_src+"res/skl_prepare.txt");
	game_res.add("skl_throw", git_src+"res/skl_throw.txt");
	game_res.add("skl_lose", git_src+"res/skl_lose.txt");

	game_res.onProgress.add(progress);
	function progress(loader, resource) {
		document.getElementById("m_bar").style.width =  Math.round(loader.progress)+"%";
	}
	
	await new Promise((resolve, reject)=> game_res.load(resolve))
	
	//убираем элементы загрузки
	document.getElementById("m_progress").outerHTML = "";	

	//короткое обращение к ресурсам
	gres=game_res.resources;

}

language_dialog = {
	
	p_resolve : {},
	
	show : function() {
				
		return new Promise(function(resolve, reject){


			document.body.innerHTML='<style>		html,		body {		margin: 0;		padding: 0;		height: 100%;	}		body {		display: flex;		align-items: center;		justify-content: center;		background-color: rgba(24,24,64,1);		flex-direction: column	}		.two_buttons_area {	  width: 70%;	  height: 50%;	  margin: 20px 20px 0px 20px;	  display: flex;	  flex-direction: row;	}		.button {		margin: 5px 5px 5px 5px;		width: 50%;		height: 100%;		color:white;		display: block;		background-color: rgba(44,55,100,1);		font-size: 10vw;		padding: 0px;	}  	#m_progress {	  background: rgba(11,255,255,0.1);	  justify-content: flex-start;	  border-radius: 100px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 10px 40px -10px #fff;	  border-radius: 100px;	  background: #fff;	  height: 70%;	  width: 0%;	}	</style><div id ="two_buttons" class="two_buttons_area">	<button class="button" id ="but_ref1" onclick="language_dialog.p_resolve(0)">RUS</button>	<button class="button" id ="but_ref2"  onclick="language_dialog.p_resolve(1)">ENG</button></div><div id="m_progress">  <div id="m_bar"></div></div>';
			
			language_dialog.p_resolve = resolve;	
						
		})
		
	}
	
}

async function define_platform_and_language(env) {
	
	let s = window.location.href;
	
	if (env === 'game_monetize') {
				
		game_platform = 'GM';
		LANG = await language_dialog.show();
		return;
	}
	
	if (s.includes('yandex')) {
		
		game_platform = 'YANDEX';
		
		if (s.match(/yandex\.ru|yandex\.by|yandex\.kg|yandex\.kz|yandex\.tj|yandex\.ua|yandex\.uz/))
			LANG = 0;
		else 
			LANG = 1;		
		return;
	}
	
	if (s.includes('vk.com')) {
		game_platform = 'VK';	
		LANG = 0;	
		return;
	}
	
	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = await language_dialog.show();
		return;
	}	

	if (s.includes('google_play')) {
			
		game_platform = 'GOOGLE_PLAY';	
		LANG = await language_dialog.show();
		return;	
	}	
	
	if (s.includes('192.168')) {
			
		game_platform = 'DEBUG';	
		LANG = 0;
		return;	
	}	
	
	game_platform = 'UNKNOWN';	
	LANG = await language_dialog.show();
	
	

}

async function init_game_env(env) {
				
	await define_platform_and_language(env);
	console.log(game_platform, LANG);
						
	//отображаем шкалу загрузки
	document.body.innerHTML='<style>html,body {margin: 0;padding: 0;height: 100%;	}body {display: flex;align-items: center;justify-content: center;background-color: rgba(41,41,41,1);flex-direction: column	}#m_progress {	  background: #1a1a1a;	  justify-content: flex-start;	  border-radius: 5px;	  align-items: center;	  position: relative;	  padding: 0 5px;	  display: none;	  height: 50px;	  width: 70%;	}	#m_bar {	  box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset;	  border-radius: 5px;	  background: rgb(119, 119, 119);	  height: 70%;	  width: 0%;	}	</style></div><div id="m_progress">  <div id="m_bar"></div></div>';
		
	
	await load_resources();
	
	await auth2.init();
	
	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({			
			apiKey: "AIzaSyA_cd8VMgkhse_4uzEhO8qfearHzdl_bgs",
			authDomain: "duel2-3fa39.firebaseapp.com",
			databaseURL: "https://duel2-3fa39-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "duel2-3fa39",
			storageBucket: "duel2-3fa39.appspot.com",
			messagingSenderId: "958114056260",
			appId: "1:958114056260:web:1e7e191c2538639e835411"
		});
	}

	//создаем приложение пикси и добавляем тень
	app = new PIXI.Application({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.view).style["boxShadow"] = "0 0 15px #000000";
	
	//изменение размера окна
	resize();
	window.addEventListener("resize", resize);

    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)

        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;
			
        case "asprite":
			objects[obj_name] = gres[obj_name].animation;
            eval(load_list[i].code0);
            break;
			
        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
				
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;
			
        case "asprite":	
			eval(load_list[i].code1);
            break;
			
        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }

	//запускаем главный цикл
	main_loop();

	//анимация лупы
	some_process.loup_anim=function() {
		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+150;
	}

	//загружаем аватарку игрока
	let loader=new PIXI.Loader();
	await new Promise(function(resolve, reject) {		
		loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
		loader.load(function(l,r) {	resolve(l)});
	});

	//устанавливаем фотки в попап и другие карточки
	objects.id_avatar.texture = objects.my_avatar.texture = loader.resources.my_avatar.texture;

	//устанавлием мое имя в карточки
	make_text(objects.id_name,my_data.name,150);
	make_text(objects.my_card_name,my_data.name,150);
	
	//разные события
	window.addEventListener("wheel", event => cards_menu.wheel_event(Math.sign(event.deltaY)));	
	window.addEventListener('keydown', function(event) { feedback.key_down(event.key)});
	document.addEventListener("visibilitychange", vis_change);
		
	//загружаем остальные данные из файербейса
	let _other_data = await firebase.database().ref("players/" + my_data.uid).once('value');
	let other_data = _other_data.val();
	
	//это защита от неправильных данных
	if (other_data===null || isNaN(other_data.rating))
		my_data.rating = 100;
	else
		my_data.rating = other_data.rating;
	
	//идентификатор клиента
	client_id = irnd(10,999999);

	other_data===null ?
		my_data.games = 0 :
		my_data.games = other_data.games || 0;
						
	//номер комнаты
	if (my_data.rating >= 222500)
		room_name= 'states2';			
	else
		room_name= 'states';
	room_name= 'states2';
	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=objects.my_card_rating.text=my_data.rating;

	//обновляем почтовый ящик
	firebase.database().ref("inbox/"+my_data.uid).set({sender:"-",message:"-",tm:"-",data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});

	//подписываемся на новые сообщения
	firebase.database().ref("inbox/"+my_data.uid).on('value', (snapshot) => { process_new_message(snapshot.val());});
	
	//обновляем базовые данные в файербейс так могло что-то поменяться
	firebase.database().ref("players/"+my_data.uid+"/name").set(my_data.name);
	firebase.database().ref("players/"+my_data.uid+"/pic_url").set(my_data.pic_url);				
	firebase.database().ref("players/"+my_data.uid+"/rating").set(my_data.rating);
	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	
	//устанавливаем мой статус в онлайн
	set_state({state : 'o'});

	//отключение от игры и удаление не нужного
	firebase.database().ref("inbox/"+my_data.uid).onDisconnect().remove();
	firebase.database().ref(room_name+"/"+my_data.uid).onDisconnect().remove();

	//keep-alive сервис
	setInterval(function()	{keep_alive()}, 40000);

	//ждем одну секунду
	await new Promise((resolve, reject) => {setTimeout(resolve, 1000);});

	some_process.loup_anim = function(){};

	//это информация с анимацией
	skl_lose=JSON.parse(game_res.resources.skl_lose.data);
	skl_prepare=JSON.parse(game_res.resources.skl_prepare.data);
	skl_throw=JSON.parse(game_res.resources.skl_throw.data);

    //подключаем события нажатия на поле
	objects.desktop.interactive = false;
    objects.desktop.pointerdown = touch.down.bind(touch);
    objects.desktop.pointermove = touch.move.bind(touch);
    objects.desktop.pointerup = touch.up.bind(touch);



	//убираем контейнер
	anim2.add(objects.id_cont,{y:[objects.id_cont.sy, -200]}, false, 0.5,'easeInBack');
	
	//контроль за присутсвием
	var connected_control = firebase.database().ref(".info/connected");
	connected_control.on("value", (snap) => {
	  if (snap.val() === true) {
		connected = 1;
	  } else {
		connected = 0;
	  }
	});

	//показыаем основное меню
	main_menu.activate();
	
}

function main_loop() {


	game_tick+=0.016666666;
	anim2.process();
	
	//обрабатываем минипроцессы
	for (let key in some_process)
		some_process[key]();	
	

	
	requestAnimationFrame(main_loop);
	
	
}

