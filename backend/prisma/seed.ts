import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Super Admin
  const superAdmin = await prisma.utilisateur.upsert({
    where: { email: 'admin@carnet-medical.cm' },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@carnet-medical.cm',
      motDePasseHash: await argon2.hash('Admin1234!'),
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`✓ Super Admin: ${superAdmin.email}`);

  // Hôpital A
  const hopitalA = await prisma.hopital.upsert({
    where: { id: 'hopital-a' },
    update: {},
    create: {
      id: 'hopital-a',
      nom: 'Hôpital A — Centre Médical Yaoundé',
      ville: 'Yaoundé',
      type: 'public',
      telephone: '+237 222 000 001',
    },
  });
  console.log(`✓ Hôpital A: ${hopitalA.nom}`);

  // Admin Hôpital A
  const adminA = await prisma.utilisateur.upsert({
    where: { email: 'admin@hopital-a.cm' },
    update: {},
    create: {
      nom: 'Dupont',
      prenom: 'Marie',
      email: 'admin@hopital-a.cm',
      motDePasseHash: await argon2.hash('Admin1234!'),
      role: 'ADMIN_HOPITAL',
      hopitalId: hopitalA.id,
    },
  });
  console.log(`✓ Admin Hôpital A: ${adminA.email}`);

  // Médecin Hôpital A
  const medecinA = await prisma.utilisateur.upsert({
    where: { email: 'medecin@hopital-a.cm' },
    update: {},
    create: {
      nom: 'Mbarga',
      prenom: 'Paul',
      email: 'medecin@hopital-a.cm',
      motDePasseHash: await argon2.hash('Medecin1234!'),
      role: 'MEDECIN',
      hopitalId: hopitalA.id,
    },
  });
  console.log(`✓ Médecin Hôpital A: ${medecinA.email}`);

  // Accueil Hôpital A
  const accueilA = await prisma.utilisateur.upsert({
    where: { email: 'accueil@hopital-a.cm' },
    update: {},
    create: {
      nom: 'Ngo',
      prenom: 'Sylvie',
      email: 'accueil@hopital-a.cm',
      motDePasseHash: await argon2.hash('Accueil1234!'),
      role: 'ACCUEIL',
      hopitalId: hopitalA.id,
    },
  });
  console.log(`✓ Accueil Hôpital A: ${accueilA.email}`);

  // Hôpital B
  const hopitalB = await prisma.hopital.upsert({
    where: { id: 'hopital-b' },
    update: {},
    create: {
      id: 'hopital-b',
      nom: 'Hôpital B — Clinique Privée Douala',
      ville: 'Douala',
      type: 'clinique privée',
      telephone: '+237 233 000 002',
    },
  });
  console.log(`✓ Hôpital B: ${hopitalB.nom}`);

  // Admin Hôpital B
  const adminB = await prisma.utilisateur.upsert({
    where: { email: 'admin@hopital-b.cm' },
    update: {},
    create: {
      nom: 'Kamga',
      prenom: 'Jean',
      email: 'admin@hopital-b.cm',
      motDePasseHash: await argon2.hash('Admin1234!'),
      role: 'ADMIN_HOPITAL',
      hopitalId: hopitalB.id,
    },
  });
  console.log(`✓ Admin Hôpital B: ${adminB.email}`);

  // Médecin Hôpital B
  const medecinB = await prisma.utilisateur.upsert({
    where: { email: 'medecin@hopital-b.cm' },
    update: {},
    create: {
      nom: 'Fotso',
      prenom: 'Anne',
      email: 'medecin@hopital-b.cm',
      motDePasseHash: await argon2.hash('Medecin1234!'),
      role: 'MEDECIN',
      hopitalId: hopitalB.id,
    },
  });
  console.log(`✓ Médecin Hôpital B: ${medecinB.email}`);

  // Accueil Hôpital B
  const accueilB = await prisma.utilisateur.upsert({
    where: { email: 'accueil@hopital-b.cm' },
    update: {},
    create: {
      nom: 'Biya',
      prenom: 'Rose',
      email: 'accueil@hopital-b.cm',
      motDePasseHash: await argon2.hash('Accueil1234!'),
      role: 'ACCUEIL',
      hopitalId: hopitalB.id,
    },
  });
  console.log(`✓ Accueil Hôpital B: ${accueilB.email}`);

  console.log('\nSeed terminé avec succès ✅');
  console.log('\nComptes de démo :');
  console.log('  Super Admin  : admin@carnet-medical.cm  / Admin1234!');
  console.log('  Admin A      : admin@hopital-a.cm       / Admin1234!');
  console.log('  Médecin A    : medecin@hopital-a.cm     / Medecin1234!');
  console.log('  Accueil A    : accueil@hopital-a.cm     / Accueil1234!');
  console.log('  Admin B      : admin@hopital-b.cm       / Admin1234!');
  console.log('  Médecin B    : medecin@hopital-b.cm     / Medecin1234!');
  console.log('  Accueil B    : accueil@hopital-b.cm     / Accueil1234!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
