"use client";

import { useState } from "react";
import type { DemoProduct } from "@/types";

type Item = { productId: string; variant?: string; quantity: number };

export function DemoLineItems({ products, initial, productName = "lineProduct", quantityName = "lineQuantity" }: { products: DemoProduct[]; initial?: Item[]; productName?: string; quantityName?: string }) {
  const [items, setItems] = useState<Item[]>(() => initial?.length ? initial : [{ productId: products[0]?.id ?? "", variant: products[0]?.variant ?? "Standard", quantity: 1 }]);
  const options = products.filter(p => !p.archived).flatMap(p => (p.variants?.length ? p.variants : [p.variant ?? "Standard"]).map(variant => ({ value: `${p.id}::${variant}`, label: `${p.name} · ${variant}` })));
  return <div className="space-y-2">{items.map((item,index)=>{
    const value=`${item.productId}::${item.variant??"Standard"}`;
    return <div key={index} className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
      <select required name={productName} value={value} aria-label="Product and variant" className="rounded-md border bg-background p-2" onChange={e=>{const [productId,variant]=e.target.value.split("::");setItems(old=>old.map((x,n)=>n===index?{...x,productId,variant}:x));}}>{options.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select>
      <input required name={quantityName} type="number" min="1" aria-label="Quantity" value={item.quantity} className="rounded-md border bg-background p-2" onChange={e=>setItems(old=>old.map((x,n)=>n===index?{...x,quantity:Math.max(1,Number(e.target.value)||1)}:x))}/>
      {items.length>1&&<button type="button" className="text-sm text-destructive" onClick={()=>setItems(old=>old.filter((_,n)=>n!==index))}>Remove</button>}
    </div>;
  })}<button type="button" className="text-sm text-primary hover:underline" onClick={()=>setItems(old=>[...old,{productId:products.find(p=>!p.archived)?.id??"",variant:products.find(p=>!p.archived)?.variant??"Standard",quantity:1}])}>Add product line</button></div>;
}
