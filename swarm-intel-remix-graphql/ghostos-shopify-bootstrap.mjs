#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDiscountGraphQL } from './lib/shopify-graphql.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
function env(name, required=true){const v=process.env[name]; if(required && !v){console.error(`Missing env ${name}`); process.exit(1);} return v}
async function main(){
  const envPath = path.join(__dirname,'.env.example');
  if(fs.existsSync(envPath)){const envContent=fs.readFileSync(envPath,'utf8'); envContent.split(/\r?\n/).forEach(line=>{const m=line.match(/^\s*([^=#\s]+)\s*=\s*(.*)\s*$/); if(m){const [_,k,vRaw]=m; if(!process.env[k]) process.env[k]=vRaw.replace(/^"(.+)"$/,'$1').replace(/^'(.+)'$/,'$1');}})}
  const SHOP=env('SHOP'); const ADMIN_TOKEN=env('ADMIN_TOKEN'); const DISCOUNT_CODE=env('DISCOUNT_CODE')||'GHOST15-R1'; const DISCOUNT_PCT=parseFloat(process.env.DISCOUNT_PCT||'15'); const DISCOUNT_EXPIRES=env('DISCOUNT_EXPIRES'); const LIMIT_TO_REPEAT_CUSTOMERS=(process.env.LIMIT_TO_REPEAT_CUSTOMERS||'false').toLowerCase()==='true';
  console.log('GraphQL-first remix: creating discount via GraphQL...');
  try{
    const d = await ensureDiscountGraphQL(SHOP,ADMIN_TOKEN,DISCOUNT_CODE,DISCOUNT_PCT,DISCOUNT_EXPIRES,LIMIT_TO_REPEAT_CUSTOMERS);
    console.log('Created discount (GraphQL):', d);
    console.log('Done');
  }catch(err){console.error('GraphQL creation failed:', err.message); process.exit(2)}
}
main();
