/* eslint-disable node/no-unpublished-import */
import {Connection, Keypair, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  createMultisig,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  burn,
} from '@solana/spl-token';
import * as payerSecretKey from './keys/payerSecretKey.json';
import * as signer1SecretKey from './keys/signer1SecretKey.json';
import * as signer2SecretKey from './keys/signer2SecretKey.json';
import * as signer3SecretKey from './keys/signer3SecretKey.json';
import * as tokenSecretKey from './keys/tokenSecretKey.json';
import * as holder1SecretKey from './keys/holder1SecretKey.json';
import * as holder2SecretKey from './keys/holder2SecretKey.json';

async function main() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const payer = Keypair.fromSecretKey(Uint8Array.from(payerSecretKey));
  console.log('payer public key => ', payer.publicKey.toBase58());

  const [signer1, signer2, signer3] = [
    Keypair.fromSecretKey(Uint8Array.from(signer1SecretKey)),
    Keypair.fromSecretKey(Uint8Array.from(signer2SecretKey)),
    Keypair.fromSecretKey(Uint8Array.from(signer3SecretKey)),
  ];

  // await createMultisig(
  //   connection,
  //   payer,
  //   [signer1.publicKey, signer2.publicKey, signer3.publicKey],
  //   3
  // );
  // multisig address => A1ZgW9cctuhiVE9YgrVz9sozpUcKbvwNKsRUdrQSGqLq

  const owner = new PublicKey('A1ZgW9cctuhiVE9YgrVz9sozpUcKbvwNKsRUdrQSGqLq');
  console.log('owner public key => ', owner.toBase58());

  const token = Keypair.fromSecretKey(Uint8Array.from(tokenSecretKey));
  console.log('token public key => ', token.publicKey.toBase58());

  const holder1 = Keypair.fromSecretKey(Uint8Array.from(holder1SecretKey));
  console.log('holder#1 public key => ', holder1.publicKey.toBase58());

  const holder2 = Keypair.fromSecretKey(Uint8Array.from(holder2SecretKey));
  console.log('holder#2 public key => ', holder2.publicKey.toBase58());

  const decimals = 9;
  try {
    const mintAccont = await createMint(
      connection,
      payer,
      owner,
      owner,
      decimals,
      token
    );
    console.log('mint account => ', mintAccont.toBase58());
  } catch {
    console.log('mint account => ', token.publicKey.toBase58());
  }

  const holder1TokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    token.publicKey,
    holder1.publicKey
  );
  console.log(
    'holder#1 associated token account => ',
    holder1TokenAccount.address.toBase58()
  );

  const holder2TokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    token.publicKey,
    holder2.publicKey
  );
  console.log(
    'holder#2 associated token account => ',
    holder2TokenAccount.address.toBase58()
  );

  const amount = BigInt(100 * 10 ** decimals);
  const mintTx = await mintTo(
    connection,
    payer,
    token.publicKey,
    holder1TokenAccount.address,
    owner,
    amount,
    [signer1, signer2, signer3]
  );
  console.log('mint tx => ', mintTx);

  const transferTx = await transfer(
    connection,
    payer,
    holder1TokenAccount.address,
    holder2TokenAccount.address,
    holder1,
    amount
  );
  console.log('transfer tx => ', transferTx);

  const burnTx = await burn(
    connection,
    payer,
    holder2TokenAccount.address,
    token.publicKey,
    holder2,
    amount
  );
  console.log('burn tx => ', burnTx);
}

main();
