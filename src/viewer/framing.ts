import * as T from 'three';

/** Fit the specimen's projected bounds at the supplied view direction and aspect. */
export function specimenDistance(box:T.Box3,direction:T.Vector3,fov:number,aspect:number,minimum:number){
 const forward=direction.clone().normalize(),right=new T.Vector3(0,1,0).cross(forward).normalize(),up=forward.clone().cross(right),tan=Math.tan(T.MathUtils.degToRad(fov/2));
 let distance=minimum;
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
  const corner=new T.Vector3(x,y,z),depth=corner.dot(forward);
  distance=Math.max(distance,depth+Math.max(Math.abs(corner.dot(right))/(tan*aspect),Math.abs(corner.dot(up))/tan)*1.12);
 }
 return distance;
}
