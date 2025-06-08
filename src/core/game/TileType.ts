
export type TileId = number;

export enum TileType {
  STRAIGHT = "straight",      
  TURN = "turn",              
  CROSS = "cross",            
  T_JUNCTION = "t_junction",  
 
}

export enum TileRotation {
  ROT_0   = 0,   
  ROT_90  = 90,  
  ROT_180 = 180, 
  ROT_270 = 270, 
}
