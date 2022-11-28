var M_WIDTH=800, M_HEIGHT=450;
var app ={stage:{},renderer:{}}, game_res, game, objects = {}, LANG = 0, state="", game_tick = 0, game_id = 0, connected = 1, client_id =0, h_state = 0, game_platform = "",
hidden_state_start = 0,room_name = 'states', pending_player = '', my_data={opp_id : ''},
opp_data={}, some_process = {}, git_src = '', ME = 0, OPP = 1, WIN = 1, DRAW = 0, LOSE = -1, NOSYNC = 2, my_turn = 1, skl_prepare, skl_throw, skl_lose,skl_die, drag = 0, obj_to_follow = null, my_player = null, opp_player = null, cont_inv = 1;

var col_data=[['head','spine',[[-11,-19],[-1,-25],[9,-21],[12,-12],[9,-4],[0,0]]],['spine','spine',[[-1,-3],[0,29]]],['left_leg1','left_leg1',[[-14,-1],[16,-1]]],['left_leg2','left_leg2',[[-13,-3],[14,-3]]],['right_leg1','right_leg1',[[-14,-1],[16,-1]]],['right_leg2','right_leg2',[[13,2],[-13,2]]],['left_arm1','left_arm1',[[14,0],[-13,0]]],['left_arm2','left_arm2',[[-12,-1],[14,-1]]],['right_arm1','right_arm1',[[-15,0],[12,0]]],['right_arm2','right_arm2',[[-14,0],[12,0]]]];
const hero_prefixes = ['s0','gl','bs','ff','sm','bm','ca'];
const hero_vs_life = {'s0':400,'gl':500,'bs':600,'ff':700,'sm':800,'bm':900,'ca':1000};

irnd = function(min,max) {	
	//inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

rnd2= function(min,max) {	
	let r=Math.random() * (max - min) + min
	return Math.round(r * 100) / 100
};

r2 = (v)=>{
	
	return (v >= 0 || -1) * Math.round(Math.abs(v)*1000)/1000;
	
}

dist = function(x0,y0,x1,y1) {	
	const dx = x0 - x1;
	const dy = y0 - y1;
	return Math.sqrt( dx*dx + dy*dy );	
}

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
		
		this.follow_type = 0;
		this.anim_on;
		this.anim_source;
		this.anim_pos;
		this.anim_time;
		this.anim_speed;
		
		this.frozen=0;
		this.frozen_start=0;
						
		this.power='none';
			
				
		this.base_skin_prefix ='';
						
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
		this.coll_data=JSON.parse(JSON.stringify(col_data));	
				
		this.base_life_level=1000;		
		this.life_level=1000;
		this.life_protection=1;

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
	
	show_life_level (show) {
		
		this.life_level_bcg.visible = show;
		this.life_level_frame.visible = show;
		this.life_level_front.visible = show;	
		
	}
	
	set_projectile_power(t) {
		
		t==='none'&&(this.projectile_bcg.texture=null);
		t==='freeze'&&(this.projectile_bcg.texture=gres.projectile_freeze.texture);
		t==='fire'&&(this.projectile_bcg.texture=gres.projectile_fire.texture);
		t==='lightning'&&(this.projectile_bcg.texture=gres.projectile_lightning.texture);
		this.power=t;
	}
					
	decrease_life(val) {	
		
		if (this.life_level === 0)
			return;
		
		let new_lev=this.life_level-val*this.life_protection;
		new_lev=~~Math.max(0,new_lev);	
		this.life_level=new_lev;
		this.life_level_front.scale_x=this.life_level_base_scale*this.life_level*0.001;
		
		if (new_lev === 0) {	
			sound.play('hit_dead');
			this.play_anim(skl_die);
			if (this === my_player)
				game.close('my_lose');			
			else
				game.close('my_win');
		}
	};
	
	make_frozen() {
		
					
		this.frozen=1;
		this.set_skin_by_prefix('s1');			
		/*this.frozen_start=game_tick;	
				
		if (this.name==='player') {
			touch.stop();
			skl_anim.slots[0].on=0;
		} else {
			
			skl_anim.slots[1].on=0;
		}*/
		
	
	}
	
	unfroze() {
		
		this.frozen = 0;
		this.set_skin_by_prefix(this.base_skin_prefix);		
		
	}
		
	update_collision() {
		
		//обновляем коллизии		
		for (let i=0;i<this.base_col.length;i++) {
			
			let limb_name=this.base_col[i][1];
			let limb_data=this.base_col[i][2];
			
			let rot=this[limb_name].rotation;	
			
			for (let p = 0; p < limb_data.length; p++) {
				
				let x=limb_data[p][0];
				let y=limb_data[p][1];

				//поворот точки коллизии
				let tx = x * Math.cos(rot) - y * Math.sin(rot);
				let ty = x * Math.sin(rot) + y * Math.cos(rot);

				//новое положение точки - положение фигуры + положение конечности + наклон конечности в зависимости от угла
				if (this.scale_x===1) {
					this.coll_data[i][2][p][0] = this.x+this[limb_name].x+tx;
					this.coll_data[i][2][p][1] = this.y+this[limb_name].y+ty;					
				} else {
					this.coll_data[i][2][p][0] = this.x-this[limb_name].x-tx;
					this.coll_data[i][2][p][1] = this.y+this[limb_name].y+ty;		
				}
			}; 		
		}
		
		
	}
	
	set_skin_by_prefix (prefix) {
		
		this.left_leg1.texture=gres[prefix+'_left_leg1'].texture
		this.left_leg2.texture=gres[prefix+'_left_leg2'].texture
		this.right_leg1.texture=gres[prefix+'_right_leg1'].texture
		this.right_leg2.texture=gres[prefix+'_right_leg2'].texture
		
		this.left_arm1.texture=gres[prefix+'_left_arm1'].texture
		this.left_arm2.texture=gres[prefix+'_left_arm2'].texture
		this.right_arm1.texture=gres[prefix+'_right_arm1'].texture
		this.right_arm2.texture=gres[prefix+'_right_arm2'].texture
		
		this.spine.texture=gres[prefix+'_spine'].texture;
		this.projectile_2.texture=gres[prefix+'_projectile'].texture	
		
	}
		
	stop() {
		
		this.process_func=this.update_collision;
	}
	
	init(skin_prefix) {
		
		this.frozen = 0;
		
		this.visible=true;
		
		this.base_skin_prefix=skin_prefix;
		
		//устанавливаем текстуры
		this.set_skin_by_prefix(skin_prefix);						
		
		//устанавливаем вид игрока
		this.skl_anim_goto_frame(skl_throw,0);
				
		//устанавливаем начальные значения сил
		

		this.set_life(hero_vs_life[skin_prefix]);
		//this.powers.block=skins_powers[this.skin_id][1];
		//this.powers.freeze=skins_powers[this.skin_id][2];
		//this.powers.fire=skins_powers[this.skin_id][3];
		
	}
	
	set_life(val) {		
		this.base_life_level=this.life_level=val;
		this.life_level_front.scale_x=this.life_level_base_scale*this.life_level*0.001;
	}

}

class projectile_class extends PIXI.Container {

	constructor() {
		super();
		
		this.follow_type = 1;
		this.x0 = 0;
		this.y0 = 0;
		this.on = 0;
		this.vx0 = 0;
		this.vy0 = 0;
		this.coll_line_pnt0=0;
		this.coll_line_pnt1=0;
		
		this.sx=0;
		this.sy=0;			
		
		this.int_x=0;
		this.int_y=0;
		
		this.P=0;
		this.t=0;
		this.disp=0;
		this.target = {};
		this.visible=false;
		
		this.process=function(){};
		
		this.p_bcg=new PIXI.Sprite();this.p_bcg.anchor.set(0.5,0.5);
		this.p_sprite=new PIXI.Sprite();this.p_sprite.anchor.set(0.5,0.5);
		this.power='none';
		
		this.hit_callback = function(){};
		
		this.addChild(this.p_bcg, this.p_sprite);
		
		objects.game_cont.addChild(this);			
		
	};		
	
	activate(params) {
		
		if (params.power === 'fire')
			this.p_bcg.texture=gres.projectile_fire.texture;	
		if (params.power === 'freeze')
			this.p_bcg.texture=gres.projectile_freeze.texture;		
		if (params.power === 'lightning')
			this.p_bcg.texture=gres.projectile_lightning.texture;		
		if (params.power === 'none')
			this.p_bcg.texture=gres.zz_projectile.texture;

					
		this.hit_callback = params.hit_callback;
		
		this.power=params.power;
		
		this.p_sprite.texture=params.spear;			
		
		this.vx0 = Math.cos(params.Q)*params.P;
		this.vy0 = Math.sin(params.Q)*params.P;
		
		this.target = params.target;
		
		if (objects.game_cont.scale_x < 0) {			
			anim2.add(objects.game_cont,{scale_x:[-0.8,-0.55],scale_y:[0.8,0.55]}, true, 7,'ease2back');
		} else {
			anim2.add(objects.game_cont,{scale_xy:[0.8,0.55]}, true, 7,'ease2back');	
		}
		

		if (this.target.name === "player1") {
			
			this.vx0=-this.vx0;				
			this.x0 = objects.player2.x-20;
			this.y0 = objects.player2.y+70;
			this.scale.x=1;
			
		} else {
			
			//запускаем снаряд в зависимости от наклона тела
			let dxv=Math.sin(objects.player1.spine.rotation);
			let dyv=-Math.cos(objects.player1.spine.rotation);			
			this.x0 = objects.player1.x+20;
			this.y0 = objects.player1.y+70;
			this.scale.x=-1;
		}
		
		this.x = this.x0;
		this.y = this.y0;
		
		this.width=90;
		this.height=20;
		this.alpha = 1;
		
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
	
	stop_on_body(int_x, int_y, pnt0, pnt1) {				

		this.on = 0;		
		this.process = this.process_stop_on_body;	
		
		this.int_x=int_x;
		this.int_y=int_y;
		
		this.sx=this.x;
		this.sy=this.y;				
		
		this.coll_line_pnt0=pnt0;
		this.coll_line_pnt1=pnt1;
		
		//вычисляем расстояние от начала линии коллизии до точки пересечения
		let dx=int_x-this.coll_line_pnt0[0];
		let dy=int_y-this.coll_line_pnt0[1];
		this.disp=Math.sqrt(dx*dx+dy*dy);	
			
	};
	
	stop_on_block() {
		
		this.on = 0;
		this.process = function(){};		
	}
	
	process_go() {
		
		if (this.visible === false)	return;		

		//обновляем позицию копья
		let vx=this.vx0;
		let vy=9.8*this.t+this.vy0;

		this.x = this.x0+vx*this.t;
		this.y = this.y0+0.5*9.8*this.t*this.t+this.vy0*this.t;
		
		this.rotation=Math.atan(vy/vx);	
		this.t+=0.09;
		
		//проверяем столкновение с объектами				
		if(this.on===1) {
			
			let l = this.get_line();	
		
			//проверяем столкновение с  частями тела игрока или оппонента			
			for (let i=0;i<this.target.coll_data.length;i++) {
				
				let limb_name=this.target.coll_data[i][0];
				let coll_data=this.target.coll_data[i][2];
				
				for (let p = 0; p < coll_data.length - 1; p++) {									
											
					let res = this.get_line_intersection(l[0], l[1], l[2], l[3], coll_data[p][0], coll_data[p][1], coll_data[p + 1][0], coll_data[p + 1][1]);
					if (res[0] !== -999 && this.on===1) {													
						
						//сообщаем в коллбэк информацию об ударе
						this.hit_callback({hit_type : 'body', limb : limb_name, coll_data:[res[0], res[1], coll_data[p], coll_data[p+1]], power : this.power});
						
						//корректируем копье чтобы оно не заходило далеко
						let proj_half_len = dist(l[0], l[1], l[2], l[3]);
						let dist_to_int = dist(l[0], l[1],res[0], res[1]);
						let dx = l[2]-l[0];
						let dy = l[3]-l[1];
						dx /= proj_half_len;
						dy /= proj_half_len;						
						this.x = this.x - (proj_half_len - dist_to_int) * dx;
						this.y = this.y - (proj_half_len - dist_to_int) * dy;
						
						
						
						
						//останавливаем копье
						this.stop_on_body(res[0], res[1], coll_data[p], coll_data[p+1]);
						return;
					}						
				}					
			}	
						
			
			
			//проверяем столкновения с другими статичными объектами
			for (let obj of game.map_col_objects) {
				
				if (obj.visible === false) continue;
				
				const coll = obj.coll_data;						
				for (let j = 0 ; j <coll.length -1 ; j++) {					
					
					let p0 = coll[j];
					let p1 = coll[j+1];
					
					let res = this.get_line_intersection(l[0], l[1], l[2], l[3], p0[0], p0[1], p1[0], p1[1]);
					if (res[0] !== -999 && this.on===1) {
						
						//сообщаем в коллбэк информацию об ударе
						this.hit_callback({hit_type : 'wall', power : this.power, wall : obj.name});
						
						//корректируем копье чтобы оно не заходило далеко
						let proj_half_len = dist(l[0], l[1], l[2], l[3]);
						let dist_to_int = dist(l[0], l[1],res[0], res[1]);
						let dx = l[2]-l[0];
						let dy = l[3]-l[1];
						dx /= proj_half_len;
						dy /= proj_half_len;						
						this.x = this.x - (proj_half_len - dist_to_int) * dx;
						this.y = this.y - (proj_half_len - dist_to_int) * dy;
						
						
						//останавливаем копье
						this.stop_on_block();
						
						return;
					}		
				}				
			}			
			
			//проверяем столкновение с бонусами
			for (let obj of game.map_bonus_objects) {
				
				if (obj.visible === false || obj.ready === false) continue;
				
				const coll = obj.coll_data;						
				for (let j = 0 ; j <coll.length -1 ; j++) {					
					
					let p0 = coll[j];
					let p1 = coll[j+1];
					
					let res = this.get_line_intersection(l[0], l[1], l[2], l[3], p0[0], p0[1], p1[0], p1[1]);
					if (res[0] !== -999 && this.on===1) {

						//добавляем бонусы только если это я пустил копье
						if (this.target === opp_player)
							power_buttons.add_bonus(obj.bonus, obj.amount);
						anim2.add(obj,{alpha:[1,0]}, false, 0.25,'linear');
					}		
				}				
			}	
			
		}	


		//проверяем вылет за пределы допустимого
		const min_x = Math.min(my_player.x,opp_player.x)-200;
		const max_x = Math.max(my_player.x,opp_player.x)+200;
		
		if (this.x < min_x || this.x  > max_x || this.y>800 || this.y<-1000) {
						
			//сообщаем в коллбэк информацию об ударе
			this.hit_callback({hit_type : 'out', power : this.power});
			
			//выключаем копье
			this.on = 0;	
			this.process = function(){};	
			anim2.add(this,{alpha:[1,0]}, false, 0.25,'linear');

		}
		
	};
	
	process_stop_on_body () {			

		//вычиляем новое направление линии конечности
		let dx=this.coll_line_pnt1[0]-this.coll_line_pnt0[0];
		let dy=this.coll_line_pnt1[1]-this.coll_line_pnt0[1];
		const d=Math.sqrt(dx*dx+dy*dy);
		dx=dx/d;
		dy=dy/d;	
		
		//вычисляем какое сейчас положение у точки ранения
		const new_pos_int_x = this.coll_line_pnt0[0] + dx*this.disp;
		const new_pos_int_y = this.coll_line_pnt0[1] + dy*this.disp;
			
		//на сколько изменилась точка ранения на столько изменяем и положение копья
		this.x = this.sx+(new_pos_int_x - this.int_x);
		this.y = this.sy+(new_pos_int_y - this.int_y);
		
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

class bonus_card_class extends PIXI.Container {
	
	constructor() {
		
		super();
		this.bcg = new PIXI.Sprite(gres.freeze_bonus_bcg.texture);
		this.bcg.anchor.set(0.5,0.5);
		this.t = new PIXI.BitmapText('X', {fontName: 'mfont',fontSize: 45});
		this.t.anchor.set(1,0.5);
		this.t.x=50;
		this.t.y=35;
		this.addChild(this.bcg, this.t);
		
	}
	
	
}

blood = {
	
	last_splash_time : 0,
	blood_start_time : 0,
	coll_line_pnt0 : [],
	coll_line_pnt1 : [],
	dir : 0,
	duration : 0,
	
	attach : function(coll_data, player, duration) {
							
		this.duration = duration;				
		this.dir = player.scale_x;
		
		//запоминаем точки конечности
		this.coll_line_pnt0=coll_data[2];
		this.coll_line_pnt1=coll_data[3];
		
		//вычисляем расстояние от начала линии коллизии до точки пересечения
		let dx=coll_data[0]-this.coll_line_pnt0[0];
		let dy=coll_data[1]-this.coll_line_pnt0[1];
		this.disp=Math.sqrt(dx*dx+dy*dy);	
		
		this.blood_start_time = game_tick;
		
	},
	
	add_splash : function() {		
	
		for(let s of objects.blood) {
			if (s.visible === false) {
	
				//вычиляем новое направление линии конечности
				let dx=this.coll_line_pnt1[0]-this.coll_line_pnt0[0];
				let dy=this.coll_line_pnt1[1]-this.coll_line_pnt0[1];
				const d=Math.sqrt(dx*dx+dy*dy);
				dx=dx/d;
				dy=dy/d;	
				
				//вычисляем какое сейчас положение у точки ранения
				const int_x = this.coll_line_pnt0[0] + dx*this.disp;
				const int_y = this.coll_line_pnt0[1] + dy*this.disp;
								
				//включаем частицу крови
				s.visible = true;
				s.start_x=s.x=int_x;
				s.start_y=s.y=int_y;	
				s.scale_xy = 0.1;
				s.alpha=1;
				s.travel_time = 0;
				s.travel_speed = rnd2(2,4) * this.dir;
				s.start_time = game_tick;

				return;				
			}		
		}		
	},
	
	process : function () {
		
		//добавляем новые капли крови
		if (game_tick < this.blood_start_time + this.duration) {
			if (game_tick > this.last_splash_time + 0.05) {
					
				this.add_splash();				
				this.last_splash_time = game_tick;
			}		
		}
		
		
		
		//обрабатываем текущие капли крови
		for(let s of objects.blood) {			
			if (s.visible === true) {
				s.x+=s.travel_speed;				
				let x_traveled = Math.abs(s.x - s.start_x);
				const travel_time_sqr = s.travel_time*s.travel_time;
				s.y = s.start_y + travel_time_sqr*0.075;				
				
				s.scale_xy += 0.015;
				s.alpha=1 - travel_time_sqr*0.0005;
				s.travel_time++;				
				
				if (game_tick > s.start_time + 2)
					s.visible = false;
			}
		}
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
		
		for (var i=0;i<this.slot.length;i++) {
			if (this.slot[i]!==null) {
				if (this.slot[i].obj===obj) {
					obj.ready = true;
					this.slot[i]=null;			
				}
			}
		}
	
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
	
	play_loop : function(snd_res) {
		
		game_res.resources[snd_res].sound.play({loop:true});	
		
	},
	
	stop : function(snd_res) {
		
		game_res.resources[snd_res].sound.stop();	
		
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
	made_moves: 0,
	timer_paused : false,
	my_role : '',
	timer_id : 0,
	on:0,
	time_left : 0,
	opp_conf_play : false,
			
	activate : async function () {
		
		game.opponent = this;
		this.on=1;
					
		//фиксируем врему начала игры для статистики
		this.start_time = Date.now();
				
		//устанавливаем локальный и удаленный статус
		set_state({state : 'p'});	
		
		this.opp_conf_play = false;
				
		//таймер
		objects.timer_cont.visible = true;
		this.switch_timer();
		this.timer_tick();		
		
		//устанаваем проигрышный рейтинг
		let lose_rating = this.calc_new_rating(my_data.rating, LOSE);
		if (lose_rating >100 && lose_rating<9999)
			firebase.database().ref("players/"+my_data.uid+"/rating").set(lose_rating);
		
		//бонус кнопки
		objects.message_button.visible=true;
		power_buttons.init();
		
	},
	
	calc_new_rating : function (old_rating, game_result) {		
		
		if (game_result === NOSYNC)
			return old_rating;
		
		var Ea = 1 / (1 + Math.pow(10, ((opp_data.rating-my_data.rating)/400)));
		if (game_result === WIN)
			return Math.round(my_data.rating + 16 * (1 - Ea));
		if (game_result === DRAW)
			return Math.round(my_data.rating + 16 * (0.5 - Ea));
		if (game_result === LOSE)
			return Math.round(my_data.rating + 16 * (0 - Ea));
		
	},
	
	switch_timer : function() {
		
		this.timer_paused=false;
		this.time_left = 20
		objects.timer_text.text = this.time_left;
		if (my_turn === 1)
			objects.timer_cont.x = 150;
		else
			objects.timer_cont.x = 650;
	},

	pause_timer : function() {
		
		this.timer_paused = true;
		
	},
		
	timer_tick : function() {
		
		
		this.timer_id = setTimeout(this.timer_tick.bind(this),1000);		
		
		//проверка долгого переключения вкладки				
		if (document.hidden === true) {
			const sec_passed = (Date.now() - hidden_state_start)/1000;	
			if (sec_passed > 3)
				game.close('no_focus');
		}				
		
		
		
		//остальное пропускаем на паузе
		if (this.timer_paused === true)
			return;		
		
		this.time_left--;
		objects.timer_text.text = this.time_left;
		
		if (my_turn === 1 && this.time_left === 0)
			game.close('my_no_time')
		
		if (my_turn === 0 && this.time_left === -3)
			game.close('opp_no_time')
						
		
				
	},
			
	send_move(move_data) {
		
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MOVE",tm:Date.now(),move_data:move_data});	
		
	},	
	
	incoming_move : function(move_data) {
		
		this.opp_conf_play = true;
		
		//дополняем информацией
		opp_player.set_projectile_power(move_data.power);	
		move_data.spear = opp_player.projectile_2.texture;
		move_data.source = opp_player;
		move_data.target = my_player;
		move_data.hit_callback = game.incoming_move_finished.bind(game);
		
		//отправляем в основной обработчик
		game.incoming_move(move_data);
		
	},
		
	make_move : function() {
		

	
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
		
	close : function(result) {
						
		clearTimeout(this.hidden_timer_tick)
		clearTimeout(this.timer_id)
		objects.timer_cont.visible = false;
		
		this.on=0;
		//если я отменил игру то сообщаем об этом сопернику
		if (result === 'my_cancel')
			firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MY_CANCEL",tm:Date.now()});
		
		if (this.opp_conf_play === false && result === 'opp_no_time')
			result = 'no_sync';
		
		if (result === 'my_win' || result === 'opp_no_time' || result === 'opp_cancel')
			sound.play('victory');
		
		if (result === 'opp_win' || result === 'my_no_time' || result === 'my_cancel' || result === 'no_focus')
			sound.play('lose');		
		
		
		
		const res_array = [
			['my_cancel',LOSE, ['Вы проиграли!\nВы отменили игру','You lose!\nYou canceled the game']],
			['no_sync',NOSYNC , ['Похоже соперник не смог начать игру','It looks like the opponent could not start the game']],
			['my_win' ,WIN, ['Вы Выиграли!','You win!']],
			['my_lose' ,LOSE, ['Вы проиграли!','You lose!']],
			['opp_no_time' ,WIN , ['Вы выиграли!\nУ соперника закончилось время','You win!\nOpponent out of time']],
			['opp_cancel',WIN, ['Вы выиграли!\nСоперник сдался','You win!\nOpponent gave up!']],
			['opp_win',LOSE , ['Вы проиграли!','You lose!']],
			['my_no_time',LOSE, ['Вы проиграли!\nУ вас закончилось время','You lose!\nYou out of time']],
			['my_cancel',LOSE , ['Вы сдались!','You gave up!']],
			['no_focus',LOSE , ['Потеряна связь!\nИспользуйте надежное интернет соединение.','Lost connection!\nUse a reliable internet connection']]
		];
		
		const result_row = res_array.find( p => p[0] === result);
		const result_str = result_row[0];		
		const result_number = result_row[1];
		const result_info = result_row[2][LANG];
		
		//бонусы за окончание игры
		if (result === 'my_win' || result==='my_lose')
			this.add_bonuses();
		
		const old_rating = my_data.rating;
		my_data.rating = this.calc_new_rating (my_data.rating, result_number);
		firebase.database().ref("players/"+my_data.uid+"/rating").set(my_data.rating);
		
		let rating_info = ['Рейтинг: ','Rating: '][LANG] + old_rating + ' >>> ' + my_data.rating;
				
		//обновляем даные на карточке
		objects.my_card_rating.text=my_data.rating;
				
		return [result_info,rating_info];
		
	},

	add_bonuses : async function() {
		
	
		//определяем сколько бонусов выдать по результатам игры
		const total_value = shop.get_total_value();
		console.log(total_value);
		let new_bonuses = {'freeze':0,'fire':0,'lightning':0,'money':0};
		if (total_value < 50) {			
			new_bonuses['freeze'] = irnd(0,3);
			new_bonuses['fire']=irnd(0,3);
			new_bonuses['lightning']=irnd(0,3);
			new_bonuses['money'] = irnd(0,3);			
		} else {
			new_bonuses['freeze'] = irnd(0,1);
			new_bonuses['fire']=irnd(0,1);
			new_bonuses['lightning']=irnd(0,1);
			new_bonuses['money'] = irnd(0,1);	
		}
			
		
		await new Promise((resolve, reject) => {setTimeout(resolve, 500);});
		
		let iter=0;
		for (let b of ['freeze','fire','lightning','money']) {
			if (new_bonuses[b]>0) {				
				objects.bonus_cards[iter].t.text='+'+new_bonuses[b];
				objects.bonus_cards[iter].bcg.texture=gres[b+'_bonus_bcg'].texture;	
				sound.play('bonus');
				objects.bonus_cards[iter].y=100+iter*70;				
				
				if (b==='money') {
					my_data.money+=new_bonuses[b];
					firebase.database().ref("players/"+my_data.uid+"/money").set(my_data.money);
				} else {
					my_data.bonuses[b]+=new_bonuses[b];
					firebase.database().ref("players/"+my_data.uid+"/bonuses").set(my_data.bonuses);
				}
				
				await anim2.add(objects.bonus_cards[iter],{x:[-50,50],rotation:[-1,0.2]}, true, 0.25,'linear');	
				iter++;
			}			
		}


		//ждем немного
		await new Promise((resolve, reject) => {setTimeout(resolve, 2000);});
		
		//убираем бонусные карты
		for(let card of objects.bonus_cards)
			if (card.visible===true)
				await anim2.add(card,{x: [50,-50]}, false, 0.25,'easeInBack');	


		
	}
	
	
}

sp_game = {

	name :'bot',
	on : 0,
	state : 'opp_move',
	center_size : 0,
	true_rating : null,
	receive_move_time : 0,
	bots_data:[ //взято из эксель файла
		[[0.90,0.95,1.00],0.20],
		[[0.88,0.94,1.00],0.17],
		[[0.86,0.93,1.00],0.14],
		[[0.84,0.92,1.00],0.11],
		[[0.82,0.91,1.00],0.08],
		[[0.80,0.90,1.00],0.05],
		[[0.78,0.89,1.00],0.02]
	],
		
	activate: async function() {
		
		//сохраняем рейтинг
		this.true_rating = my_data.rating;
		this.on = 1;		
		
		//рейтинг не настоящий поэтому его затемняем
		objects.my_card_rating.alpha = 0.5;

		game.opponent = this;
		
		opp_data.uid = 'BOT';
		opp_data.rating = 100;		
			
		//устанавливаем локальный и удаленный статус
		set_state ({state : 'b'});	
			
		this.sp_start = game_tick;
		
		//бонус кнопки
		objects.message_button.visible=false;
		power_buttons.init();

	},	
	
	switch_timer : function() {},
	
	pause_timer : function(){},
	
	process : function() {
					

		
	},	
	
	send_move(move_data) {
		
		
		
	},
		
	calc_v0_for_Q : function(del_q) {

		let x0 = opp_player.x-20;
		let y0 = opp_player.y+70;

		let x1 = my_player.x+60;
		let y1 = my_player.y+70;
		
		let dx=x0-x1;
		let dh=y1-y0;
		
		//вычисляем угол между точкой запуском и целью
		let Q1= Math.atan2(dh, dx);		

		//добавляем еще угол чтобы запуск происходил по дуге
		let Q=Q1-del_q;
		
		let v1=(x0-x1)/Math.cos(Q);
		let v2=0.5*9.8/(dh-Math.tan(Q)*dx)
		let v0=v1*Math.sqrt(v2);
				
		return [Q, v0];	
		
	},
		
	make_move : async function() {
								
		if (this.on === 0) return;
		
				
		//запускаем снаряд бота
		[Q,P] = this.calc_v0_for_Q(rnd2(0.4,0.8));
		
		let power = 'none';
		const power_prob = this.bots_data[my_data.bot_level][0];
		const random_prob = Math.random();		
		if (random_prob > power_prob[0] && random_prob <= power_prob[1])
			power = 'freeze'
		if (random_prob > power_prob[1] && random_prob <= power_prob[2])
			power = 'fire'
		if (random_prob > power_prob[2] && random_prob <= power_prob[3])
			power = 'lightning'
		
		const max_dev_ang = this.bots_data[my_data.bot_level][1]
		const dev_ang = rnd2(-max_dev_ang,max_dev_ang);
		
		opp_player.set_projectile_power(power);	
		
		const move_data = {	Q : Q+dev_ang,
							P : P,
							spear : opp_player.projectile_2.texture,
							source : opp_player,
							target : my_player,
							power : power,
							hit_callback : game.incoming_move_finished.bind(game)							
							};
		console.log(Q,P)
		game.start_move (move_data);		
		
	},

	long_no_focus : function() {
		
		
	},

	reset_timer : function() {
		
		
	},
					
	close : function(result) {		
		
		this.on = 0;	
		if (result === 'my_win') {
			my_data.bot_level++;
			my_data.bot_level=Math.min(my_data.bot_level, hero_prefixes.length-1);
			firebase.database().ref("players/"+my_data.uid+"/bot_level").set(my_data.bot_level);
		}	
		
	
		
		const res_array = [
			['my_cancel',LOSE, ['Вы проиграли!\nВы отменили игру','You lose!\nYou canceled the game']],
			['no_sync',NOSYNC , ['Похоже соперник не смог начать игру','It looks like the opponent could not start the game']],
			['my_win' ,WIN, ['Вы Выиграли!','You win!']],
			['my_lose' ,LOSE, ['Вы проиграли!','You lose!']],
			['opp_no_time' ,WIN , ['Вы выиграли!\nУ соперника закончилось время','You win!\nOpponent out of time']],
			['opp_cancel',WIN, ['Вы выиграли!\nСоперник сдался','You win!\nOpponent gave up!']],
			['opp_win',LOSE , ['Вы проиграли!','You lose!']],
			['my_no_time',LOSE, ['Вы проиграли!\nУ вас закончилось время','You lose!\nYou out of time']],
			['my_cancel',LOSE , ['Вы сдались!','You gave up!']],
			['switch',DRAW , ['switch!','switch!']],
			['no_focus',LOSE , ['Потеряна связь!\nИспользуйте надежное интернет соединение.','Lost connection!\nUse a reliable internet connection']]
		];
		
		const result_row = res_array.find( p => p[0] === result);
		const result_str = result_row[0];		
		const result_number = result_row[1];
		const result_info = result_row[2][LANG];
				
		if (result_number === WIN)
			sound.play('victory');
		
		if (result_number === LOSE)
			sound.play('lose');		
		
		return [result_info,')))'];
		
	},
	
	switch_close : function() {
		
		awaiter.kill_all();
		objects.fire.visible = false;
		this.close('switch');	
		
	}

}

game = {	

	start_player : 0,
	start_time : 0,
	parallax_data : {},
	on : 0,	
	my_platform_name : '',
	opp_platform_name : '',
	opponent : {},
	scene_dir : 1,
	map_col_objects : [],
	map_bonus_objects : [],
	
	add_fire : function(player) {
		
		if (player.scale_x <0)
			objects.fire.x = player.x - 145;
		else
			objects.fire.x = player.x+ 30;
		
		objects.fire.y = player.y+55;
		objects.fire.alpha = 1;
		objects.fire.visible = true;
		objects.fire.play();
		objects.fire.player = player;
		objects.started_time = game_tick;
		
	},
	
	activate : async function(start_player, opponent, map_id){
				

		//убираем объекты так как они могли остаться от предыдущих игр
		objects.s_obj0.visible=false;
		objects.s_obj1.visible=false;
		objects.s_obj2.visible=false;
		
		//случайная дельта чтобы не было одно и тоже
		touch.wind_dev = rnd2(-0.15,0.15);
		
		
		objects.loading_info.visible=true;
		
		//фиксируем объекты которые должны проверятся на коллизии и выключаем их видимость
		this.map_col_objects = [objects.platform1,objects.platform2,objects.s_obj0,objects.s_obj1,objects.s_obj2];
		this.map_bonus_objects = [objects.bonus0,objects.bonus1,objects.bonus2];
		[...this.map_col_objects, ...this.map_bonus_objects].forEach(o=>o.visible=false);
		
	
		//console.log("Загружаем текстуру "+objects.mini_cards[id].name)
		//map_id = 13;
		var map_loader = new PIXI.Loader();	
		map_loader.add("map_load_list", "map"+map_id+"/map_load_list.txt",{timeout: 5000});
		await new Promise(function(resolve, reject) {map_loader.load(function(l,r) {	resolve(l)});});
		
		const map_data = eval(map_loader.resources.map_load_list.data);
		
		//добавляем из листа загрузки карты
		for (var i = 0; i < map_data.length; i++)
			if (map_data[i].class === "sprite" || map_data[i].class === "image" )
				map_loader.add(map_data[i].name, git_src+'map'+map_id+'/' + map_data[i].name + "." +  map_data[i].image_format);
		await new Promise(function(resolve, reject) {map_loader.load(function(l,r) {	resolve(l)});});
		
		objects.loading_info.visible=false;
		sound.play('start');
		
		//устанаваем объекты сцены
		for (var i = 0; i < map_data.length; i++) {
			const obj_class = map_data[i].class;
			const obj_name = map_data[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name].texture = map_loader.resources[obj_name].texture;
				eval(map_data[i].code0);
				break;

			case "block":
				eval(map_data[i].code0);
				break;

			}
		}
		
		
		//устанаваем фон 
		objects.desktop.visible = true;
		objects.desktop.texture = map_loader.resources.bcg.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.4,'linear');
		anim2.add(objects.game_cont,{alpha:[0,1]}, true, 0.4,'linear');
		

		objects.parallax.visible = true;
		objects.parallax.texture = map_loader.resources.parallax.texture;
		objects.parallax.scale_xy = 0.85;

		if (my_data.rating === 1400)
			this.show_tutorial();
		
		this.on = 1;
		this.opponent = opponent;
		
		if (start_player === ME)
			my_turn = 1
		else
			my_turn = 0
				
		this.start_time = game_tick;
		
		//если открыт лидерборд то закрываем его
		if (objects.lb_1_cont.visible===true)
			lb.close();		
		
		if (objects.shop_cont.visible===true)
			shop.close();	
		
		//выключаем бота соперника если он работает
		sp_game.switch_close();		
		
		anim2.add(objects.sbg_button,{x:[850,objects.sbg_button.sx]}, true, 0.6,'easeOutBack');	
		
		//активируем все что связано с онлайн или ботом
		await this.opponent.activate();
		
		//убираем все стрелы
		objects.projectiles.forEach(p => {
			p.on = 0;
			p.visible = false;
		})
		

		
		//показыаем карточки
		anim2.add(objects.my_card_cont,{x:[-100,objects.my_card_cont.sx]}, true, 0.6,'easeOutBack');	
		anim2.add(objects.opp_card_cont,{x:[850,objects.opp_card_cont.sx]}, true, 0.6,'easeOutBack');	
				
		//устанавливаем кто начальный игрок 
		this.start_player = start_player;	
		
	
		//инициируем игроков
		objects.player1.show_life_level(true);
		objects.player2.show_life_level(true);
		
		
		//персчитываем коллизии
		objects.player1.update_collision();
		objects.player2.update_collision();		
		
		
		some_process.game = this.process.bind(this);


		objects.desktop.interactive = true;
		
		if (start_player === ME) {
			
			my_player = objects.player1;
			opp_player = objects.player2;
			
			this.my_platform_name = 'platform1';
			this.opp_platform_name = 'platform2';
			
			obj_to_follow = my_player;
			objects.game_cont.scale_x = 0.8;
			objects.game_cont.scale_y = 0.8;
			this.scene_dir = 1;
			
		} else {
			
			my_player = objects.player2;
			opp_player = objects.player1;
			this.my_platform_name = 'platform2';
			this.opp_platform_name = 'platform1';
			
			obj_to_follow = opp_player;
			objects.game_cont.scale_x = -0.8;
			objects.game_cont.scale_y = 0.8;
			this.scene_dir = -1;
		}
		
		my_player.init(hero_prefixes[my_data.hero_id]);
		this.load_and_init_opponent();


		
		//нарисуем коллизии для отладки
		/*objects.collision_drawer.visible = true;
		objects.collision_drawer.lineStyle(6, 0xFEEB77, 1);
		objects.collision_drawer.moveTo(map_col_data[0][0],map_col_data[0][1]);	
		for (let obj of map_col_data) {
			for (let p = 1 ; p < obj.length; p++)			
				objects.collision_drawer.lineTo(obj[p][0],obj[p][1]);			
			
		}*/

	},
	
	show_tutorial : async function() {
				
		objects.hand.visible = true;
		objects.hand.texture = gres.hand.texture;
		await anim2.add(objects.hand,{x:[250,255],y:[450,150],}, true, 1,'easeInOutCubic');	
		objects.hand.texture = gres.hand1.texture;
		await new Promise((resolve, reject) => {setTimeout(resolve, 300);});
		await anim2.add(objects.hand,{x:[255,150],y:[150,250],}, true, 1,'easeInOutCubic');	
		objects.hand.texture = gres.hand.texture;
		await anim2.add(objects.hand,{x:[150,250],y:[250,450],}, false, 0.5,'easeInOutCubic');	
	},
		
	load_and_init_opponent : async function() {
		
		if (opp_data.uid === 'BOT') {			
			opp_player.init(hero_prefixes[my_data.bot_level]);
			return
		}
		
		//определяем какой герой у соперника
		const _opp_hero_id = await firebase.database().ref("players/"+opp_data.uid + "/hero_id").once('value');
		opp_data.hero_id = _opp_hero_id.val() || 0;		
		opp_player.init(hero_prefixes[opp_data.hero_id]);
		
	},	
		
	process : function() {
		
		let tar_pivot_x;
		let tar_pivot_y;
		
		if (obj_to_follow.follow_type === 0) {
			tar_pivot_x = obj_to_follow.x + obj_to_follow.projectile.x*obj_to_follow.scale_x;
			tar_pivot_y = obj_to_follow.y + obj_to_follow.projectile.y;		
		} 
		
		if (obj_to_follow.follow_type === 1) {			
			tar_pivot_x = obj_to_follow.x ;
			tar_pivot_y = obj_to_follow.y;			
		}
		
		const dx = tar_pivot_x - objects.game_cont.pivot.x;
		const dy = tar_pivot_y - objects.game_cont.pivot.y;
		const d = Math.sqrt(dx*dx+dy*dy);
		
		if (d>10) {			
		
			objects.game_cont.pivot.x += dx/10;
			objects.game_cont.pivot.y += dy/10;
			

			const bcg_dx2 = objects.game_cont.pivot.x - this.parallax_data.scene_cen_x;
			const bcg_dy2 = objects.game_cont.pivot.y - this.parallax_data.scene_cen_y;
						
			objects.parallax.x = this.parallax_data.cen_x - this.scene_dir*bcg_dx2 / 20;
			objects.parallax.y = this.parallax_data.cen_y - bcg_dy2 / 20;	
		}
				
		this.map_bonus_objects.forEach(b=>{
			b.rotation=Math.sin(game_tick*3)*0.2;
		})		
				
		//обрабатываем горение
		if (objects.fire.visible === true && objects.fire.ready === true) {
			
			objects.fire.player.decrease_life(1);
			if (game_tick - objects.started_time > 2.25)
				anim2.add(objects.fire,{alpha:[1,0]}, false, 1,'linear');			
		}
	
		
		//обрабатываем вращение бонусных карточек
		for (let b=0;b<4;b++)
			if (objects.bonus_cards[b].visible===true)
				objects.bonus_cards[b].rotation=Math.sin(game_tick*2+b)*0.2;

				
		objects.projectiles.forEach(p=>p.process());
	},

	incoming_move : function(move_data) {
		
		//получение хода от игрока другого	
		game.opponent.pause_timer();
		this.start_move(move_data);		
		
	},
	
	start_move : function(move_data){
		
		//запускаем снаряд
		let projectile = game.add_projectile(move_data);
							
		obj_to_follow = projectile;
		
		//запускаем анимацию
		move_data.source.play_anim(skl_throw);	
		move_data.source.projectile.visible = false;
		move_data.source.zz_projectile.visible = false;
		
		//возвращаем копье игроку
		setTimeout(function(){
			anim2.add(move_data.source.projectile,{alpha:[0,1]}, true, 0.5,'linear');
			anim2.add(move_data.source.zz_projectile,{alpha:[0,1]}, true, 0.5,'linear');
			
		},1700);	
		
	},	
				
	incoming_move_finished : async function(hit_data) {
		
		console.log('Прилетело от бота или онлайна ', hit_data);		
		this.process_finished_move(hit_data, my_player);	
	},
	
	outcoming_move_finished : async function(hit_data) {
				
		console.log('Мое копье прилетело ', hit_data);		
		this.process_finished_move(hit_data, opp_player);
	},
	
	process_finished_move : async function(hit_data, target_player) {
		
		if (hit_data.hit_type === 'body') {
						
						
						
			//это базовое уменьшение жизни
			target_player.decrease_life(100);	

			//дополнительный урон за попадание в голову
			if (hit_data.limb === 'head') {
				target_player.decrease_life(100);					
				sound.play('hit_head');
				blood.attach(hit_data.coll_data, target_player,1.5);	
			} else {
				sound.play('hit_body');
				blood.attach(hit_data.coll_data, target_player,1);	
				
			}

			
					
						
			if (hit_data.power === 'freeze') {		

				sound.play('freezed');
				//дополнительный урон за замороженую стрелу
				target_player.decrease_life(50);
		
				//если уже заморожен то размараживаем
				if (target_player.frozen === 1) {				
					target_player.unfroze();					
				} else {
					target_player.make_frozen();	

					//немного ждем чтобы показать заморозку
					if (await awaiter.add(1.5)===false) return;					
				}


			} else {
				
				if (hit_data.power === 'fire') {
					this.add_fire(target_player);						
					sound.play('flame');
				}
				

				if (target_player.frozen === 1)
					target_player.unfroze();			
			}			
		}
		
		if (hit_data.hit_type === 'wall') {
			
			sound.play('hit_wall');
			
			if (target_player.frozen === 1)
				target_player.unfroze();	

		}
		
		if (hit_data.hit_type === 'out') {
			
			if (target_player.frozen === 1)
				target_player.unfroze();	
		}
	
		if (hit_data.power === 'lightning') {	


			//проверяем молнию
			let light_on = false; 
			if (hit_data.hit_type === 'wall') {
				if (hit_data.wall === this.my_platform_name && target_player === my_player)
					light_on = true;	
				if (hit_data.wall === this.opp_platform_name && target_player === opp_player)
					light_on = true;
			}
			
			if (hit_data.hit_type === 'body')
				light_on = true;
				
			
			if (light_on === true) {					
					blood.attach([target_player.coll_data[1][2][0][0],target_player.coll_data[1][2][0][1],target_player.coll_data[1][2][0],target_player.coll_data[1][2][1]],target_player,1.5);
					obj_to_follow = target_player;
					if (await this.show_lightning(target_player) === false)
						return;						
			}		
		}		
		
		
		//немного ждем чтобы показать как воткнулась
		if (hit_data.hit_type === 'wall') 
			if (await awaiter.add(1.5)===false) return;		
		
		//определяем на кого теперь фокусировать камеру и кто ходит
		if ((target_player === my_player) === (target_player.frozen===1)){
			obj_to_follow = opp_player;
			my_turn = 0;
		} else {
			obj_to_follow = my_player;
			my_turn = 1;	
		}
				
		if (this.on === 1)
			this.opponent.switch_timer();				
		
		//немного ждем и передаем ход сопернику (боту)
		if (my_turn === 0) {			
			if (await awaiter.add(2.5)===false)	return false;	
			this.opponent.make_move();
		}
		

		
	},
		
	show_lightning : async function(player) {
				
		objects.lightning.visible=true;
		objects.lightning.alpha=1;
		objects.lightning.x = player.x + 85*player.scale_x;
		objects.lightning.y = player.y-295;
				
		for (let i = 0 ; i < 6; i++) {
			
			sound.play('lightning');
			player.decrease_life(30);
			objects.lightning.texture  = gres['lightning'+i%3].texture;
			anim2.add(objects.lightning,{alpha:[1,0]}, false, 0.25,'linear');
			if (await awaiter.add(0.25)===false)
				return false;	
				
		}
		
	},
	
	add_projectile : function(params) {
		
		
		sound.play('throw');
		
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

	stop_button_down : function() {
		
		if (objects.sbg_button.ready === false) {
			sound.play('locked');
			return
		}
		
		
		sound.play('click');
		this.close('my_cancel');
		
	},

	close : async function(result) {
		
		if (this.on === 0) return;
		this.on = 0;
		
		//убираем стикеры если их видно
		if (objects.stickers_cont.visible===true)
			stickers.hide_panel();
		
		//убираем карточки
		anim2.add(objects.my_card_cont,{x:[objects.my_card_cont.sx,-100]}, false, 0.4,'easeInBack');	
		anim2.add(objects.opp_card_cont,{x:[objects.opp_card_cont.sx,850]}, false, 0.4,'easeInBack');	
		
		awaiter.kill_all();
		
		objects.desktop.interactive = false;

		anim2.add(objects.sbg_button,{x:[objects.sbg_button.x,850]}, false, 0.6,'easeInBack');	
		
		touch.close();
		
		power_buttons.close();
			
		const res_text = this.opponent.close(result);
		

				
		await big_message.show(res_text[0], res_text[1]);
		
		some_process.game = function(){};	
		anim2.add(objects.game_cont,{alpha:[1,0]}, false, 0.4,'linear');	
		objects.parallax.visible = false;
		objects.fire.visible = false;
				
		main_menu.activate();
		
		ad.show();
		
		set_state({state : 'o'});			
				
	},
	

}

awaiter = {
	
	slots : [null, null, null],
	
	add : function(time) {
		
		for (var i=0;i<3;i++) {
			if (this.slots[i] === null) {
				this.slots[i] = {resolve : 0 , time : time, start_time : game_tick};		
				break;
			}			
		}		
		
		return new Promise(resolve => {			
			this.slots[i].resolve = resolve;			
		})
	},
	
	kill_all : function() {
		
		for (let i=0;i<3;i++) {		
			if (this.slots[i] !== null) {
				this.slots[i].resolve(false);					
				this.slots[i]=null;
			}			
		}		
	},
		
	process : function() {
		
		for (let i=0;i<3;i++) {		
			if (this.slots[i] !== null) {
				if (game_tick - this.slots[i].start_time > this.slots[i].time) {
					this.slots[i].resolve(true);					
					this.slots[i]=null;
				}				
			}			
		}	
	}
	
}

power_buttons = {
		
	selected_power: 'none',
	rem_time:{freeze:0, fire:0,block:0, },
		
	down : function(bonus) {
		
		
		
		
		if (my_data.bonuses[bonus] === 0) {
			
			sound.play('locked');
			return;
		}

		
		if (this.selected_power===bonus) {
			this.selected_power='none';				
			my_player.set_projectile_power('none');		
			objects.upg_button_frame.visible=false;
		} else {
			sound.play('click2');
			this.selected_power=bonus;				
			my_player.set_projectile_power(bonus);	
			const button_ref = objects[bonus + '_button'];
			objects.upg_button_frame.x=button_ref.x;
			objects.upg_button_frame.y=button_ref.y;
			objects.upg_button_frame.visible=true;
		}
		
		
		
		
	},
	
	add_bonus : function(bonus, amount) {
		
		sound.play('click2');
		my_data.bonuses[bonus]+=amount;
		firebase.database().ref("players/"+my_data.uid+"/bonuses").set(my_data.bonuses);
		this.update_info();
	},
	
	process: function() {
		

	},
	
	bonus_fired : function(bonus) {
		
		my_data.bonuses[bonus]--;	
		firebase.database().ref("players/"+my_data.uid+"/bonuses").set(my_data.bonuses);
		this.update_info();
		
		//если больше не осталось бонус копий
		if (my_data.bonuses[bonus] === 0) {			
			this.selected_power='none';			
			objects.upg_button_frame.visible=false;	
			my_player.set_projectile_power('none');				
		}

		
		
	},	

	update_info : function() {
		
		objects.freeze_text.text=my_data.bonuses.freeze;
		objects.fire_text.text=my_data.bonuses.fire;
		objects.lightning_text.text=my_data.bonuses.lightning;
		
	},
	
	init: function () {
		
		
		anim2.add(objects.power_buttons_cont,{y:[450,objects.power_buttons_cont.sy]}, true, 1,'linear');	
		
		this.update_info();
	},
	
	close : function() {
		anim2.kill_anim(objects.power_buttons_cont);
		anim2.add(objects.power_buttons_cont,{y:[objects.power_buttons_cont.y,450]}, false, 1,'linear');	
		
	}
	
}

start_game = {
	
	parallax_data : {},
	on : 0,
	turn : 0,
	opponent : {},
	map_data : {},	
	add_fire : function(player) {
		
		if (player.scale_x <0)
			objects.fire.x = player.x - 145;
		else
			objects.fire.x = player.x+ 30;
		
		objects.fire.y = player.y+55;
		objects.fire.alpha = 1;
		objects.fire.visible = true;
		objects.fire.play();
		objects.fire.player = player;
		objects.started_time = game_tick;
		
	},
	
	activate : async function(){
				
		//убираем объекты так как они могли остаться от предыдущих игр
		objects.s_obj0.visible=false;
		objects.s_obj1.visible=false;
		objects.s_obj2.visible=false;
		
		//console.log("Загружаем текстуру "+objects.mini_cards[id].name)
		map_id = 10;
		var map_loader = new PIXI.Loader();	
		map_loader.add("map_load_list", "map"+map_id+"/map_load_list.txt",{timeout: 5000});
		await new Promise(function(resolve, reject) {map_loader.load(function(l,r) {	resolve(l)});});
		
		const  map_data = eval(map_loader.resources.map_load_list.data);
		this.on = 1;
		
		//загружаем картинки в соответствии с листом загрузки
		for (var i = 0; i < map_data.length; i++)
			if (map_data[i].class === "sprite" || map_data[i].class === "image" )
				map_loader.add(map_data[i].name, git_src+'map'+map_id+'/' + map_data[i].name + "." +  map_data[i].image_format);
		await new Promise(function(resolve, reject) {map_loader.load(function(l,r) {	resolve(l)});});
		
		if (this.on === 0) return;
				
		//устанаваем объекты сцены
		for (var i = 0; i < map_data.length; i++) {
			const obj_class = map_data[i].class;
			const obj_name = map_data[i].name;
			console.log('Processing: ' + obj_name)

			switch (obj_class) {
			case "sprite":
				objects[obj_name].texture = map_loader.resources[obj_name].texture;
				eval(map_data[i].code0);
				break;

			case "block":
				eval(map_data[i].code0);
				break;

			}
		}
		
		//устанаваем фон 
		objects.desktop.visible = true;
		objects.desktop.texture = map_loader.resources.bcg.texture;
		anim2.add(objects.desktop,{alpha:[0,1]}, true, 0.4,'linear');

		objects.parallax.visible = true;
		objects.parallax.texture = map_loader.resources.parallax.texture;
		objects.parallax.scale_xy = 0.85;

		this.on = 1;

		//убираем все стрелы
		objects.projectiles.forEach(p => {
			p.on = 0;
			p.visible = false;
		})
		
					
		anim2.add(objects.rain_cont,{alpha:[0,1]}, true, 1,'linear');			
		anim2.add(objects.game_cont,{alpha:[0,1]}, true, 1,'linear');	

		//инициируем игроков
		my_player = objects.player1;
		opp_player = objects.player2;
		
		const skins = ['s0','ca','s1','bm','sm','ff','bs','gl'];
		
		objects.player1.init(skins[irnd(0,skins.length-1)]);
		objects.player1.show_life_level(false);
		
		objects.player2.init(skins[irnd(0,skins.length-1)]);
		objects.player2.show_life_level(false);
		
		obj_to_follow = objects.player1;
				
		//персчитываем коллизии
		objects.player1.update_collision();
		objects.player2.update_collision();
		
		some_process.game = this.process.bind(this);
		
		//капли дождя
		let ang = 1.4;
		let dx = Math.cos(ang)*40;
		let dy = Math.sin(ang)*40;
		objects.rain_drops.forEach(d=>{
			
			d.dx=dx;
			d.dy=dy;
			d.rotation=ang;
			d.alpha=0.4;
			d.height=10;
		})
		
		
		if (await awaiter.add(0.5)===false) return;		
		
		this.turn = 1;
		
		this.move_finished();

	},
	
	process : function() {
		
		let tar_pivot_x;
		let tar_pivot_y;
		
		if (obj_to_follow.follow_type === 0) {
			tar_pivot_x = obj_to_follow.x + obj_to_follow.projectile.x*obj_to_follow.scale_x;
			tar_pivot_y = obj_to_follow.y + obj_to_follow.projectile.y;		
		} 
		
		if (obj_to_follow.follow_type === 1) {			
			tar_pivot_x = obj_to_follow.x ;
			tar_pivot_y = obj_to_follow.y;			
		}
		
		const dx = tar_pivot_x - objects.game_cont.pivot.x;
		const dy = tar_pivot_y - objects.game_cont.pivot.y;
		const d = Math.sqrt(dx*dx+dy*dy);
		
		if (d>10) {			
		
			objects.game_cont.pivot.x += dx/10;
			objects.game_cont.pivot.y += dy/10;
			

			const bcg_dx2 = objects.game_cont.pivot.x - this.parallax_data.scene_cen_x;
			const bcg_dy2 = objects.game_cont.pivot.y - this.parallax_data.scene_cen_y;

			objects.parallax.x = this.parallax_data.cen_x - bcg_dx2 / 20;
			objects.parallax.y = this.parallax_data.cen_y - bcg_dy2 / 20;	
		}			
				
		//дождь
		for (let i =0 ; i < objects.rain_drops.length ; i ++) {
			
			objects.rain_drops[i].x+=objects.rain_drops[i].dx;
			objects.rain_drops[i].y+=objects.rain_drops[i].dy;
			
			if (objects.rain_drops[i].y > 450) {
				objects.rain_drops[i].x=irnd(0,800);
				objects.rain_drops[i].y=irnd(0,-450);
			}
		}
				
		objects.projectiles.forEach(p=>p.process());
	},
	
	start_move : function(move_data){
		
		//запускаем снаряд
		let projectile = game.add_projectile(move_data);
							
		obj_to_follow = projectile;
		
		//запускаем анимацию
		move_data.source.play_anim(skl_throw);	
		move_data.source.projectile.visible = false;
		move_data.source.zz_projectile.visible = false;
		
		//возвращаем копье игроку
		setTimeout(function(){
			anim2.add(move_data.source.projectile,{alpha:[0,1]}, true, 0.5,'linear');
			anim2.add(move_data.source.zz_projectile,{alpha:[0,1]}, true, 0.5,'linear');
			
		},1700);	
		
	},	
		
	move_finished : async function(hit_data) {
				
		console.log('Копье прилетело ', hit_data);	
		let move_data;
		
		
		if (hit_data!==undefined && hit_data.hit_type === 'body') {
						
			if (hit_data.limb === 'head') {		
				sound.play('hit_head');
			} else {
				sound.play('hit_body');
			}
		}
		
		if (hit_data!==undefined && hit_data.hit_type === 'wall') {			
			sound.play('hit_wall');			
		}
		
		
		if (await awaiter.add(1)===false) return;
		if (this.turn === 1) {
			
			obj_to_follow = objects.player1;
			move_data = {	Q : rnd2(-0.4,-0.8),
								P : 120,
								spear : objects.player1.projectile_2.texture,
								source : objects.player1,
								target : objects.player2,
								power : 'none',
								hit_callback : start_game.move_finished.bind(start_game)							
								};
		} else {
			obj_to_follow = objects.player2;
			move_data = {	Q : rnd2(-0.4,-0.8),
								P : 120,
								spear : objects.player2.projectile_2.texture,
								source : objects.player2,
								target : objects.player1,
								power : 'none',
								hit_callback : start_game.move_finished.bind(start_game)							
								};
		}
		
		if (await awaiter.add(1)===false) return;
		this.start_move (move_data);
		
		this.turn = 1 - this.turn;
		
		
		

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

	close : async function(result) {
		
		if (this.on === 0) return;
		this.on = 0;

		awaiter.kill_all();
		
		objects.desktop.interactive = false;
				
		some_process.game = function(){};		
				
		anim2.add(objects.rain_cont,{alpha:[1,0]}, false, 0.4,'linear');	
		anim2.add(objects.game_cont,{alpha:[1,0]}, false, 0.4,'linear');	
		objects.parallax.visible = false;
		objects.fire.visible = false;
				
	}
	
}

touch = {

	Q:0,
	moved:0,
	touch_len:0,
	wind_dev : 0,

	touch_data : {
		x0: 0,
		y0: 0,
		x1: 0,
		y1: 0
	},

    down: function (e) {
		
		this.Q=0;
		
		if (my_turn === 0) return;
				
        this.touch_data.x0 = e.data.global.x / app.stage.scale.x;
        this.touch_data.y0 = e.data.global.y / app.stage.scale.y;

        this.touch_data.x1 = this.touch_data.x0;
        this.touch_data.y1 = this.touch_data.y0;		
	
        drag = 1;
    },

    move: function (e) {
		
		if (my_turn === 0) return;

        if (drag === 1) {
			
			if (objects.guide_line.visible===false)
				objects.guide_line.visible=true;
			
            this.touch_data.x1 = e.data.global.x / app.stage.scale.x;
            this.touch_data.y1 = e.data.global.y / app.stage.scale.y;
            
			let dx = this.touch_data.x0 - this.touch_data.x1;
			let dy = this.touch_data.y0 - this.touch_data.y1;

			this.touch_len = Math.sqrt(dx * dx + dy * dy);
			this.touch_len = Math.max(50, Math.min(this.touch_len, 300));

			this.Q = Math.atan2(dy, dx);
			this.Q = Math.max(-1.57, Math.min(this.Q, 0));
			my_player.skl_anim_tween(skl_prepare,0.5+this.Q/0.785398/2);

			//обновляем данные на основе корректированной длины
			this.touch_data.x1 = this.touch_data.x0 + this.touch_len * Math.cos(this.Q);
			this.touch_data.y1 = this.touch_data.y0 + this.touch_len * Math.sin(this.Q);



			objects.guide_line_base.width=this.touch_len;
			objects.guide_line_base.rotation=this.Q;
			objects.guide_line_tip.x = 400 + Math.cos(this.Q)*this.touch_len;
			objects.guide_line_tip.y = 225 + Math.sin(this.Q)*this.touch_len;
			objects.guide_line_tip.rotation=this.Q;
			
			
			//отображаем направляющую в зависимости от наклона тела
			let dxv=Math.sin(my_player.spine.rotation);
			let dyv=-Math.cos(my_player.spine.rotation);			
			//objects.dir_line.x = objects.player.x+objects.player.spine.x+dxv*30;
			//objects.dir_line.y = objects.player.y+objects.player.spine.y+dyv*30;
			
			//это значит что движение произведено
			this.moved=1;
			
			//objects.dir_line.rotation=this.Q;

        }

    },

    up: function () {
		
		if (my_turn === 0 || drag === 0) return;		
				
        drag = 0;	
		my_turn = 0;		
		
		//запускаем локальный снаряд и получаем его ссылку
		let Q = r2(this.Q + this.wind_dev);
		let P = this.touch_len*0.6;
		
		//отправляем сопернику
		game.opponent.send_move({Q:Q, P:P, power:power_buttons.selected_power});		
		game.opponent.pause_timer();
		
		objects.guide_line.visible=false;
		
		game.start_move ({
			Q : Q,
			P : P,
			source : my_player,
			target : opp_player,
			spear : my_player.projectile_2.texture,
			power : power_buttons.selected_power,
			hit_callback : function(hit_data) {
				game.outcoming_move_finished(hit_data);
			}
		});		
		
		//сообщаем если выстрелили бонусом
		if (power_buttons.selected_power !== 'none')
			power_buttons.bonus_fired(power_buttons.selected_power)

    },
	
	close : function() {
		objects.guide_line.visible=false;
		drag=0;
		
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
		cards_menu.accepted_invite(msg);
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
			if (msg.message==='MOVE')
				mp_game.incoming_move(msg.move_data);
			
			//получение сообщение с ходом игорка
			if (msg.message==='MY_CANCEL')
				game.close('opp_cancel');
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
				sound.play('invite');
			
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

		if (mp_game.on===1 || objects.req_cont.ready===false || objects.req_cont.visible===false || objects.big_message_cont.visible===true)
			return;

		//устанавливаем окончательные данные оппонента
		opp_data = req_dialog._opp_data;	
	
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

		//отправляем информацию о согласии играть с идентификатором игры
		game_id=~~(Math.random()*999);
		const fp = irnd(0,1);
		const map_id = irnd(0,13);
		
		
		//отправляем данные о начальных параметрах игры сопернику
		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"ACCEPT", tm:Date.now(), game_id : game_id, w_dev:0, fp : 1 - fp, map_id : map_id});

		//заполняем карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,100);
		objects.opp_card_rating.text=objects.req_rating.text;
		objects.opp_avatar.texture=objects.req_avatar.texture;

		main_menu.close();
		cards_menu.close();
		sp_game.switch_close();

		game.activate(fp, mp_game, map_id);

	},

	hide: function() {

		//если диалог не открыт то ничего не делаем
		if (objects.req_cont.ready === false || objects.req_cont.visible === false)
			return;
	
		anim2.add(objects.req_cont,{y:[objects.req_cont.sy, -260]}, false, 0.5,'easeInBack');

	}

}

main_menu= {

	activate: async function() {


		sound.play_loop('rain', true)
		start_game.activate();
		objects.start_game_cover.visible = true;
		objects.start_game_cover.alpha = objects.start_game_cover.base_alpha;
		//objects.start_game_cover.tint = 0x444444;

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
		
		start_game.close();
		sound.stop('rain')

		anim2.add(objects.start_game_cover,{alpha:[0.5,0]}, false, 0.5,'linear');
		//some_process.main_menu = function(){};
		objects.mb_cont.visible=false;
		some_process.main_menu_process = function(){};
		anim2.add(objects.mb_cont,{x:[objects.mb_cont.x,800]}, true, 0.5,'easeInOutCubic');
		anim2.add(objects.game_title,{y:[objects.game_title.y,-300]}, true, 0.5,'linear');
		//await anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.6,'linear');	
	},

	pb_down: async function () {


		anim2.kill_anim(objects.game_cont);		
		if (anim2.any_on()===true || objects.id_cont.visible === true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		cards_menu.activate();

	},
	
	lb_button_down: async function () {

		anim2.kill_anim(objects.game_cont);
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');

		await this.close();
		lb.show();

	},

	rules_button_down: async function () {

		anim2.kill_anim(objects.game_cont);
		if (anim2.any_on()===true) {
			sound.play('locked');
			return
		};

		sound.play('click');
		
		sound.play('click');
		await this.close();
		rules.activate();


	},

	shop_button_down : async function() {
		
		anim2.kill_anim(objects.game_cont);		
		if (anim2.any_on()===true || objects.id_cont.visible === true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		
		this.close();
		shop.activate();
		
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

shop = {
	
	cur_hero : 0,
	cur_spear : 0,
	spear_prices : {'freeze':10,'fire':5,'lightning':15},
	spears_list : ['freeze','fire','lightning'],
	hero_prices : [0,10,30,50,80,150,300,450,600,350,500],
	
	activate : function() {		
	
		this.cur_hero = my_data.hero_id;
		
		anim2.add(objects.shop_cont,{x:[-800,objects.shop_cont.sx]}, true, 0.5,'easeOutBack');	

				
		this.change_player_down(0);				
		this.change_balance(0);				
		this.change_spear_down(0);
		
		some_process.shop = this.process;		
		
		
	},
	
	show_info(info) {
		
		objects.shop_info.text = info;
		objects.shop_info.show_time = game_tick;
		anim2.add(objects.shop_info,{alpha:[0,1]}, true, 0.5,'linear');	
		
	},	
	
	change_player_down : function(val) {
		
		sound.play('click');
		this.cur_hero+=val;
		this.cur_hero = Math.min(Math.max(this.cur_hero, 0), 6);
		
		const hero_names = ['STICKMAN','GREEN LIGHT','BEAST','NARUTO','SPIDER-MAN','BATMAN','CAPTAIN AMERICA'];
		
		objects.shop_player.set_skin_by_prefix(hero_prefixes[this.cur_hero]);	
		objects.shop_player_title.text = hero_names[this.cur_hero];
		
		objects.shop_player_info.text = ['Цена: ','Price: '][LANG] + this.hero_prices[this.cur_hero]+'$';
		objects.shop_player_info.text += '\n'+['ЖИЗНЬ: ','LIFE: '][LANG] + ~~(hero_vs_life[hero_prefixes[this.cur_hero]]*0.1);
	},
		
	change_spear_down : function(val) {
		sound.play('click');
		
		this.cur_spear+=val;		
		this.cur_spear = Math.min(Math.max(this.cur_spear, 0), 2);
		const cur_spear_name = this.spears_list[this.cur_spear];
		const spear_name_translator = {'freeze':['ФРИЗ','FREEZE'],'fire':['ОГОНЬ','FIRE'],'lightning':['МОЛНИЯ','LIGHTNING']}
		const spear_info = {
			'freeze':['замораживает соперника на один ход, наносит дополнительный урон','freezes the opponent for one turn, make additional damage'][LANG],
			'fire':['поджигает соперника, наносит дополнительный урон','sets fire to the opponent, make additional damage'][LANG],
			'lightning':['вызывает молнию, нансоит дополнительный урон, нужно попасть в платформу','causes lightning, make additional damage, you need to hit the platform'][LANG]
		};
		
		
		
		objects.shop_spear.texture=gres['projectile_'+cur_spear_name].texture;
		objects.shop_spear_title.text = spear_name_translator[cur_spear_name][LANG] + ' (x' +my_data.bonuses[cur_spear_name]+')';
		
		const price = this.spear_prices[cur_spear_name];	;
		objects.shop_spear_price.text = ['Цена: ','Price: '][LANG] + price+'$';
		objects.shop_spear_info.text =spear_info[cur_spear_name];
		
	},	
		
	player_buy_down : function() {
			
		const price = this.hero_prices[this.cur_hero];	

		if (anim2.any_on()===true)
			return;
		
		if (my_data.money < price) {
			this.show_info(['Недостаточно денег','Not enough money'][LANG]);
			sound.play('locked');
			return;
		}
		
		if (my_data.hero_id === this.cur_hero) {
			this.show_info('Уже куплено');
			return;
		}			
			
		sound.play('buy');
		my_data.hero_id = this.cur_hero;
		objects.shop_player.set_skin_by_prefix(hero_prefixes[my_data.hero_id]);
		firebase.database().ref("players/"+my_data.uid+"/hero_id").set(my_data.hero_id);
		this.show_info(['Куплено!!!','Purchased!!!'][LANG]);

		this.change_balance(-price);
		
	},
	
	change_balance : function(val) {
		
		my_data.money+=val;
		objects.shop_balance.text = my_data.money + '$';
		firebase.database().ref("players/"+my_data.uid+"/money").set(my_data.money);
		
	},
	
	spear_buy_down : function() {
		
		if (anim2.any_on()===true)
			return;
		
		const cur_spear_name = this.spears_list[this.cur_spear];
		const price = this.spear_prices[cur_spear_name];		
		
		if (my_data.money < price) {
			this.show_info(['Недостаточно денег','Not enough money'][LANG]);
			sound.play('locked');
			return;
		}
		
		this.show_info(['Куплено!!!','Purchased!!!'][LANG]);
		
		sound.play('buy');

		this.change_balance(-price);
		my_data.bonuses[cur_spear_name]++;
		firebase.database().ref("players/"+my_data.uid+"/bonuses").set(my_data.bonuses);
		this.change_spear_down(0);
		
	},
	
	process : function() {
		
		objects.shop_player.skl_anim_tween(skl_prepare,0.5+Math.sin(game_tick)*0.5);
		objects.shop_spear.rotation+=0.01;
		
		if (objects.shop_info.visible===true && objects.shop_info.ready===true)
			if (game_tick > objects.shop_info.show_time+5) 
				anim2.add(objects.shop_info,{alpha:[1,0]}, false, 0.5,'linear');	
	},
	
	back_down : function() {		

		if (anim2.any_on()===true || objects.id_cont.visible === true) {
			sound.play('locked');
			return
		};
		
		sound.play('click');
		this.close();
		main_menu.activate();
		
	},
	
	get_total_value : function() {
		
		let total_sum=0;
		for (const b of this.spears_list)
			total_sum += my_data.bonuses[b]*this.spear_prices[b];		
		total_sum+=this.hero_prices[my_data.hero_id];
		total_sum+=my_data.money;		
		return total_sum;
		
	},
	
	close : function() {
		
		anim2.add(objects.shop_cont,{x:[objects.shop_cont.x,-800]}, false, 0.5,'easeInBack');	
		some_process.shop = function(){};		
		
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
				
		objects.rules_text.text = ['Добро пожаловать в игру Стикмэны. Битва на копьях (онлайн)!\n\nЦель игры - поразить соперника метким пуском копья. Каждое попадание отнимает часть жизни у игрока, а попадание в голову отнимает у игрока еще большую часть его жизни. Для начала игры необходимо выбрать соперника, открыв его карточку и нажав кнопку "Пригласить". Если соперник согласится принять ваш вызов, то игра начнется. Метания копий происходят по очереди. Для запуска копья необходимо нажать на центр экрана (мышкой или пальцем), провести пальцем к левому нижнему углу, задавая тем самым силу запуска и отпустить указатель от экрана для пуска. Игровой магазин даст тебе возможность купить более стойкого персонажа или дополнить свой арсенал копьями с дополнительными силами, что увеличит твои шансы на выигрыш.\n\nУдачной игры!','Welcome to the Stickmen game. Battle on spears (online)!\nThe goal of the game is to hit the opponent with a well-aimed spear launch. Each hit takes away a part of the life, and a hit to the head takes away an even larger part of the life. To start the game, you need to select an opponent by opening his card and clicking the "Invite" button. If the opponent agrees to accept your challenge, then the game will begin. Throwing of spears takes place in turn. To launch the spear, you need to click on the center of the screen (with the mouse or finger), swipe your finger to the lower left corner, thereby setting the launch force and release the pointer from the screen to launch. The game store will give you the opportunity to buy a more resistant character or supplement your arsenal with spears with additional powers, which will increase your chances of winning.\nHave fun playing!'][LANG];
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
			sound.play('locked');
			return;			
		}
		
		sound.play('click');


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
		
		sound.play('click');

		//анимационное появление панели стикеров
		anim2.add(objects.stickers_cont,{y:[objects.stickers_cont.sy, -450]}, false, 0.5,'easeInBack');

	},

	send : async function(id) {

		if (objects.big_message_cont.visible === true || objects.req_cont.visible === true || objects.stickers_cont.ready===false) {
			return;			
		}
		
		sound.play('click');
		
		if (this.promise_resolve_send!==0)
			this.promise_resolve_send("forced");

		this.hide_panel();

		firebase.database().ref("inbox/"+opp_data.uid).set({sender:my_data.uid,message:"MSG",tm:Date.now(),data:id});

		//показываем какой стикер мы отправили
		objects.sent_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
		objects.sent_sticker_area.x=objects.sent_sticker_area.sx;
		await anim2.add(objects.sent_sticker_area,{alpha:[0, 1]}, true, 0.5,'linear');
		
		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_send = resolve;
				setTimeout(resolve, 1000)
			}
		);
		
		if (res === "forced")
			return;

		await anim2.add(objects.sent_sticker_area,{x:[objects.sent_sticker_area.sx, -150]}, false, 0.5,'easeInBack');
	},

	receive: async function(id) {

		
		if (this.promise_resolve_recive!==0)
			this.promise_resolve_recive("forced");

		//воспроизводим соответствующий звук
		sound.play('receive_sticker');

		objects.rec_sticker_area.texture=game_res.resources['sticker_texture_'+id].texture;
	
		await anim2.add(objects.rec_sticker_area,{x:[950, objects.rec_sticker_area.sx]}, true, 0.5,'easeOutBack');

		let res = await new Promise((resolve, reject) => {
				stickers.promise_resolve_recive = resolve;
				setTimeout(resolve, 2000)
			}
		);
		
		if (res === "forced")
			return;

		anim2.add(objects.rec_sticker_area,{x:[objects.rec_sticker_area.sx, 950]}, false, 0.5,'easeInBack');

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
		objects.mini_cards[0].name=objects.mini_cards[0].name_text.text=['Стикмэн','Stickman'][LANG];

		objects.mini_cards[0].rating=100;		
		objects.mini_cards[0].rating_text.text = objects.mini_cards[0].rating;
		objects.mini_cards[0].avatar.texture=new PIXI.Texture(gres[hero_prefixes[my_data.bot_level]+'_spine'].texture, new PIXI.Rectangle(0, 0, 150, 200));
		//objects.mini_cards[0].avatar.texture.updateUvs();
		
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
	
		anim2.add(objects.invite_cont,{y:[-400, objects.invite_cont.sy]}, true, 0.15,'easeOutBack');
		
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
		anim2.add(objects.cards_menu_header,{y:[ objects.cards_menu_header.y, -50]}, false, 0.2,'easeInCubic');
		anim2.add(objects.cards_cont,{alpha:[1,0]}, false, 0.2,'linear');		
		anim2.add(objects.back_button,{x:[objects.back_button.sx, 800]}, false, 0.2,'easeInCubic');
		//anim2.add(objects.desktop,{alpha:[1,0]}, false, 0.4,'linear');
		await anim2.add(objects.players_online,{y:[objects.players_online.y, 470]}, false, 0.2,'easeInCubic');

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


		anim2.add(objects.invite_cont,{y:[objects.invite_cont.y,450]}, false, 0.15,'easeInBack');
	},

	send_invite: async function() {


		if (objects.invite_cont.ready===false || objects.invite_cont.visible===false)
			return;

		if (anim2.any_on() === true || ['Ждите ответ..','Waiting...'].includes(objects.invite_button_title.text)) {
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
			game.activate(ME, sp_game, my_data.bot_level);
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

	accepted_invite: async function(msg) {

		//убираем запрос на игру если он открыт
		req_dialog.hide();
		
		//устанаваем окончательные данные оппонента
		opp_data=cards_menu._opp_data;
		
		//сразу карточку оппонента
		make_text(objects.opp_card_name,opp_data.name,100);
		objects.opp_card_rating.text=opp_data.rating;
		objects.opp_avatar.texture=objects.invite_avatar.texture;		

		//закрываем меню и начинаем игру
		await cards_menu.close();
		game.activate(msg.fp, mp_game, msg.map_id);
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
	
	get_country_code : function() {

		return new Promise(resolve=>{
			
			setTimeout(function(){resolve('')}, 3000);
			
			try {
				
				fetch("https://api.ipgeolocation.io/ipgeo?apiKey=4c6d2cb089694af98693c69b8d65d39a")
				.then((resp1)=>{return resp1.json()})
				.then((resp2)=>{resolve(resp2.country_code2)});
	
			} catch(e){				
				resolve ('');
			}	
			
		})	
		
	},
	
	get_country_code2 : function() {

		return new Promise(resolve=>{
			
			setTimeout(function(){resolve('')}, 3000);
			
			try {
				
				fetch("https://ipinfo.io/json?token=63f43de65702b8")
				.then((resp1)=>{return resp1.json()})
				.then((resp2)=>{resolve(resp2.country)});
	
			} catch(e){				
				resolve ('');
			}	
			
		})			
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
			
			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GM_');
			my_data.name = this.get_random_name(my_data.uid);
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

			my_data.uid = this.search_in_local_storage() || this.get_random_uid_for_local('GP_');
			my_data.name = this.get_random_name(my_data.uid);
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

		if (document.hidden === true) {
			hidden_state_start = Date.now();				
			sound.stop('rain');
		}			
		
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

	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('win',git_src+'sounds/win.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('clock',git_src+'sounds/clock.mp3');
	game_res.add('lightning',git_src+'sounds/lightning2.mp3');
	game_res.add('flame',git_src+'sounds/flame.mp3');
	game_res.add('click2',git_src+'sounds/click2.mp3');
	game_res.add('freezed',git_src+'sounds/freezed.mp3');
	game_res.add('throw',git_src+'sounds/throw.mp3');
	game_res.add('hit_wall',git_src+'sounds/hit_wall.mp3');
	game_res.add('hit_head',git_src+'sounds/hit_head.mp3');
	game_res.add('dialog',git_src+'sounds/dialog.mp3');
	game_res.add('hit_body',git_src+'sounds/hit_body.mp3');
	game_res.add('hit_dead',git_src+'sounds/hit_dead.mp3');
	game_res.add('victory',git_src+'sounds/victory.mp3');
	game_res.add('rain',git_src+'sounds/rain.mp3');
	game_res.add('buy',git_src+'sounds/buy.mp3');
	game_res.add('invite',git_src+'sounds/invite.mp3');
	game_res.add('start',git_src+'sounds/start.mp3');
	game_res.add('bonus',git_src+'sounds/bonus.mp3');
	game_res.add('receive_sticker',git_src+'sounds/receive_sticker.mp3');
	
	
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++) {
        if (load_list[i].class === "sprite" || load_list[i].class === "image" )
            game_res.add(load_list[i].name, git_src+'res/'+lang_pack + '/' + load_list[i].name + "." +  load_list[i].image_format);
        if (load_list[i].class === "asprite" )
            game_res.add(load_list[i].name, git_src+"gifs/" + load_list[i].res_name);
	}

	//добавляем текстуры стикеров
	for (var i=0;i<16;i++)
		game_res.add("sticker_texture_"+i, git_src+"res/stickers/"+i+".png");


	//вручную добавляем скины так как они на отдельном листе
	const skins_prefixes = ['zz','s0','s1','gl','bs','ff','sm','bm','ca'];
	const limb_names = ['spine','left_arm1','left_arm2','right_arm1','right_arm2','left_leg1','left_leg2','right_leg1','right_leg2','projectile'];
	for(let s of skins_prefixes)
		for (let l of limb_names)
			game_res.add(s +'_' + l, git_src+'res/SKINS/' + s + '_' + l + ".png");

	//добавляем огонь
	for (var i = 0; i < 32; i++)
		game_res.add("fire"+i, git_src+"res/FIRE/image_part_0"+(i+1)+ ".png");

	//это файл с анимациями который нужно оптимизировать потом
	game_res.add("skl_prepare", git_src+"res/skl_prepare.txt");
	game_res.add("skl_throw", git_src+"res/skl_throw.txt");
	game_res.add("skl_lose", git_src+"res/skl_lose.txt");
	game_res.add("skl_die", git_src+"res/skl_die.txt");
	
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
	
	if (s.includes('crazygames')) {
			
		game_platform = 'CRAZYGAMES';	
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
			apiKey: "AIzaSyAeoRG7nAiFuwGO1YPpywpAbjntzBKN2yA",
			authDomain: "duel2n.firebaseapp.com",
			databaseURL: "https://duel2n-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "duel2n",
			storageBucket: "duel2n.appspot.com",
			messagingSenderId: "431209862903",
			appId: "1:431209862903:web:e575c7f704fca7e01fa5f2"
		});
	}

	//создаем приложение пикси и добавляем тень
	app.stage = new PIXI.Container();
	app.renderer = new PIXI.Renderer({width:M_WIDTH, height:M_HEIGHT,antialias:true});
	document.body.appendChild(app.renderer.view).style["boxShadow"] = "0 0 15px #000000";
	
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
	
	//разные события
	document.addEventListener("visibilitychange", vis_change);
		
	//загружаем остальные данные из файербейса
	let _other_data = await firebase.database().ref("players/" + my_data.uid).once('value');
	let other_data = _other_data.val();
	
	//это защита от неправильных данных
	my_data.rating = other_data?.rating || 1400;
	my_data.hero_id = other_data?.hero_id || 0;
	my_data.money = other_data?.money || 0;
	my_data.bonuses = other_data?.bonuses || {freeze:0, fire:0,lightning:0};
	my_data.bot_level = other_data?.bot_level || 0;
	my_data.games = other_data?.games || 0;

		
	//добавляем информацию о стране
	const country =  other_data?.country || await auth2.get_country_code() || await auth2.get_country_code2();
	

	//идентификатор клиента
	client_id = irnd(10,999999);
						
	//номер комнаты
	room_name= 'states2'
	
	//устанавливаем рейтинг в попап
	objects.id_rating.text=objects.my_card_rating.text=my_data.rating;

	//обновляем почтовый ящик
	firebase.database().ref("inbox/"+my_data.uid).set({sender:"-",message:"-",tm:"-",data:{x1:0,y1:0,x2:0,y2:0,board_state:0}});

	//подписываемся на новые сообщения
	firebase.database().ref("inbox/"+my_data.uid).on('value', (snapshot) => { process_new_message(snapshot.val());});
	
	//обновляем базовые данные в файербейс так могло что-то поменяться
	firebase.database().ref("players/"+my_data.uid+"/name").set(my_data.name);
	firebase.database().ref("players/"+my_data.uid+"/country").set(country);
	firebase.database().ref("players/"+my_data.uid+"/pic_url").set(my_data.pic_url);				
	firebase.database().ref("players/"+my_data.uid+"/rating").set(my_data.rating);
	firebase.database().ref("players/"+my_data.uid+"/hero_id").set(my_data.hero_id);
	firebase.database().ref("players/"+my_data.uid+"/money").set(my_data.money);
	firebase.database().ref("players/"+my_data.uid+"/bonuses").set(my_data.bonuses);
	firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
	
	//добавляем страну в имя
	my_data.name = my_data.name+' (' +country +')'
	
	//устанавлием мое имя в карточки
	make_text(objects.id_name,my_data.name,150);
	make_text(objects.my_card_name,my_data.name,100);
	
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
	skl_die=JSON.parse(game_res.resources.skl_die.data);
	
    //подключаем события нажатия на поле
	objects.desktop.interactive = false;
    objects.desktop.pointerdown = touch.down.bind(touch);
    objects.desktop.pointermove = touch.move.bind(touch);
    objects.desktop.pointerup = touch.up.bind(touch);
    objects.desktop.pointerupoutside = touch.up.bind(touch);


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

var now, then=Date.now(), elapsed;

function main_loop() {
	
	
	now = Date.now();
	elapsed = now-then;
	
    if (elapsed > 10) {

        //then = now - (elapsed % 10);

		game_tick+=0.016666666;
		anim2.process();
		
		//обрабатываем минипроцессы
		for (let key in some_process)
			some_process[key]();	
		
		blood.process();
		
		//обработка кастомных промисов
		awaiter.process();

    }

	//отображаем сцену
	app.renderer.render(app.stage);		

	requestAnimationFrame(main_loop);	

	
	
}

