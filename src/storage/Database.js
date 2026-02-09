import fs from 'fs';
import path from 'path';

export class Database {
  constructor(opts = {}) {
    this.projectRoot = opts.projectRoot || process.cwd();
    this.dir = opts.dir || path.join(this.projectRoot, 'data');
    this.filePath = opts.filePath || path.join(this.dir, 'db.json');
    fs.mkdirSync(this.dir, { recursive: true });

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify({ bounties: {}, claims: {} }, null, 2), 'utf8');
    }
  }

  read() {
    return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  upsertBounty(bounty) {
    const db = this.read();
    if (!bounty?.bountyId) throw new Error('bountyId is required');
    db.bounties[bounty.bountyId] = { ...(db.bounties[bounty.bountyId] || {}), ...bounty };
    this.write(db);
    return db.bounties[bounty.bountyId];
  }

  upsertClaim(bountyId, claim) {
    const db = this.read();
    if (!bountyId) throw new Error('bountyId is required');
    if (!claim?.claimId) throw new Error('claimId is required');

    if (!db.claims[bountyId]) db.claims[bountyId] = {};
    db.claims[bountyId][claim.claimId] = { ...(db.claims[bountyId][claim.claimId] || {}), ...claim };
    this.write(db);
    return db.claims[bountyId][claim.claimId];
  }

  getClaims(bountyId) {
    const db = this.read();
    return Object.values(db.claims[bountyId] || {});
  }
}
