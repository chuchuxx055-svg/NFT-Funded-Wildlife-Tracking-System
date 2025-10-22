/** @format */

import { describe, it, expect, beforeEach } from "vitest";
import { uintCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_ANIMAL_NOT_FOUND = 101;
const ERR_INSUFFICIENT_FUNDS = 102;
const ERR_ALREADY_RELEASED = 103;
const ERR_INVALID_MILESTONE = 104;
const ERR_INVALID_AMOUNT = 105;
const ERR_INVALID_RECIPIENT = 106;
const ERR_MILESTONE_NOT_VERIFIED = 107;
const ERR_ESCROW_NOT_FOUND = 108;
const ERR_INVALID_ANIMAL_ID = 109;
const ERR_INVALID_MILESTONE_ID = 110;
const ERR_FUNDS_LOCKED = 111;
const ERR_REFUND_NOT_ALLOWED = 112;
const ERR_INVALID_TIMESTAMP = 113;
const ERR_GOVERNANCE_NOT_SET = 114;
const ERR_ORACLE_NOT_SET = 115;
const ERR_INVALID_PERCENTAGE = 116;
const ERR_MAX_MILESTONES_EXCEEDED = 117;
const ERR_INVALID_REFUND_PERIOD = 118;
const ERR_REFUND_PERIOD_EXPIRED = 119;
const ERR_INVALID_FEE_RATE = 120;
const ERR_FEE_TRANSFER_FAILED = 121;
const ERR_INVALID_MIN_AMOUNT = 122;
const ERR_INVALID_MAX_AMOUNT = 123;
const ERR_ANIMAL_ALREADY_REGISTERED = 124;
const ERR_INVALID_STATUS = 125;
const ERR_PAUSED = 126;
const ERR_NOT_PAUSED = 127;
const ERR_INVALID_PAUSE_DURATION = 128;
const ERR_INVALID_GRACE_PERIOD = 129;
const ERR_GRACE_PERIOD_NOT_MET = 130;

interface Escrow {
  totalAmount: number;
  releasedAmount: number;
  lockedTimestamp: number;
  status: string;
}

interface Milestone {
  amount: number;
  verified: boolean;
  releaseTimestamp: number;
  recipient: string;
  description: string;
}

interface Allocation {
  amountReleased: number;
  recipient: string;
  timestamp: number;
}

interface RefundRequest {
  amount: number;
  requestedTimestamp: number;
  approved: boolean;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class DonationEscrowMock {
  state: {
    governanceContract: string;
    oracleContract: string;
    platformFeeRate: number;
    refundPeriod: number;
    maxMilestones: number;
    minLockAmount: number;
    maxLockAmount: number;
    contractPaused: boolean;
    pauseDuration: number;
    gracePeriod: number;
    escrowBalances: Map<number, Escrow>;
    milestones: Map<string, Milestone>;
    fundAllocations: Map<string, Allocation>;
    refundRequests: Map<string, RefundRequest>;
  } = {
    governanceContract: "ST1TEST",
    oracleContract: "ST1TEST",
    platformFeeRate: 5,
    refundPeriod: 144,
    maxMilestones: 10,
    minLockAmount: 100,
    maxLockAmount: 1000000,
    contractPaused: false,
    pauseDuration: 0,
    gracePeriod: 24,
    escrowBalances: new Map(),
    milestones: new Map(),
    fundAllocations: new Map(),
    refundRequests: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";
  stxTransfers: Array<{ amount: number; from: string; to: string }> = [];
  animalRegistry: Map<number, boolean> = new Map();

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      governanceContract: "ST1TEST",
      oracleContract: "ST1TEST",
      platformFeeRate: 5,
      refundPeriod: 144,
      maxMilestones: 10,
      minLockAmount: 100,
      maxLockAmount: 1000000,
      contractPaused: false,
      pauseDuration: 0,
      gracePeriod: 24,
      escrowBalances: new Map(),
      milestones: new Map(),
      fundAllocations: new Map(),
      refundRequests: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.stxTransfers = [];
    this.animalRegistry = new Map();
  }

  setGovernance(newGovernance: string): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.governanceContract = newGovernance;
    return { ok: true, value: true };
  }

  setOracle(newOracle: string): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    this.state.oracleContract = newOracle;
    return { ok: true, value: true };
  }

  setPlatformFeeRate(newRate: number): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newRate > 100) return { ok: false, value: ERR_INVALID_PERCENTAGE };
    this.state.platformFeeRate = newRate;
    return { ok: true, value: true };
  }

  setRefundPeriod(newPeriod: number): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newPeriod <= 0) return { ok: false, value: ERR_INVALID_REFUND_PERIOD };
    this.state.refundPeriod = newPeriod;
    return { ok: true, value: true };
  }

  setMaxMilestones(newMax: number): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newMax <= 0) return { ok: false, value: ERR_MAX_MILESTONES_EXCEEDED };
    this.state.maxMilestones = newMax;
    return { ok: true, value: true };
  }

  setMinLockAmount(newMin: number): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newMin <= 0) return { ok: false, value: ERR_INVALID_MIN_AMOUNT };
    this.state.minLockAmount = newMin;
    return { ok: true, value: true };
  }

  setMaxLockAmount(newMax: number): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newMax <= this.state.minLockAmount)
      return { ok: false, value: ERR_INVALID_MAX_AMOUNT };
    this.state.maxLockAmount = newMax;
    return { ok: true, value: true };
  }

  pauseContract(duration: number): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (this.state.contractPaused) return { ok: false, value: ERR_PAUSED };
    if (duration <= 0) return { ok: false, value: ERR_INVALID_PAUSE_DURATION };
    this.state.contractPaused = true;
    this.state.pauseDuration = this.blockHeight + duration;
    return { ok: true, value: true };
  }

  unpauseContract(): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (!this.state.contractPaused) return { ok: false, value: ERR_NOT_PAUSED };
    if (this.blockHeight < this.state.pauseDuration)
      return { ok: false, value: ERR_GRACE_PERIOD_NOT_MET };
    this.state.contractPaused = false;
    this.state.pauseDuration = 0;
    return { ok: true, value: true };
  }

  setGracePeriod(newPeriod: number): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newPeriod <= 0) return { ok: false, value: ERR_INVALID_GRACE_PERIOD };
    this.state.gracePeriod = newPeriod;
    return { ok: true, value: true };
  }

  lockFunds(animalId: number, amount: number): Result<boolean> {
    if (this.state.contractPaused) return { ok: false, value: ERR_PAUSED };
    if (animalId <= 0) return { ok: false, value: ERR_INVALID_ANIMAL_ID };
    if (amount < this.state.minLockAmount || amount > this.state.maxLockAmount)
      return { ok: false, value: ERR_INVALID_AMOUNT };
    if (!this.animalRegistry.has(animalId))
      return { ok: false, value: ERR_ANIMAL_NOT_FOUND };
    if (this.state.escrowBalances.has(animalId))
      return { ok: false, value: ERR_ANIMAL_ALREADY_REGISTERED };
    const fee = Math.floor((amount * this.state.platformFeeRate) / 100);
    this.stxTransfers.push({
      amount: fee,
      from: this.caller,
      to: this.state.governanceContract,
    });
    this.stxTransfers.push({
      amount: amount - fee,
      from: this.caller,
      to: "contract",
    });
    this.state.escrowBalances.set(animalId, {
      totalAmount: amount - fee,
      releasedAmount: 0,
      lockedTimestamp: this.blockHeight,
      status: "active",
    });
    return { ok: true, value: true };
  }

  addMilestone(
    animalId: number,
    milestoneId: number,
    amount: number,
    recipient: string,
    description: string
  ): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (milestoneId <= 0) return { ok: false, value: ERR_INVALID_MILESTONE_ID };
    if (amount <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
    if (recipient === this.caller)
      return { ok: false, value: ERR_INVALID_RECIPIENT };
    if (milestoneId > this.state.maxMilestones)
      return { ok: false, value: ERR_MAX_MILESTONES_EXCEEDED };
    const escrow = this.state.escrowBalances.get(animalId);
    if (!escrow) return { ok: false, value: ERR_ESCROW_NOT_FOUND };
    const key = `${animalId}-${milestoneId}`;
    if (this.state.milestones.has(key))
      return { ok: false, value: ERR_INVALID_MILESTONE };
    if (escrow.releasedAmount + amount > escrow.totalAmount)
      return { ok: false, value: ERR_INSUFFICIENT_FUNDS };
    this.state.milestones.set(key, {
      amount,
      verified: false,
      releaseTimestamp: 0,
      recipient,
      description,
    });
    return { ok: true, value: true };
  }

  verifyMilestone(animalId: number, milestoneId: number): Result<boolean> {
    if (this.caller !== this.state.oracleContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    const key = `${animalId}-${milestoneId}`;
    const milestone = this.state.milestones.get(key);
    if (!milestone) return { ok: false, value: ERR_INVALID_MILESTONE };
    if (milestone.verified)
      return { ok: false, value: ERR_MILESTONE_NOT_VERIFIED };
    this.state.milestones.set(key, { ...milestone, verified: true });
    return { ok: true, value: true };
  }

  releaseFunds(animalId: number, milestoneId: number): Result<boolean> {
    if (this.state.contractPaused) return { ok: false, value: ERR_PAUSED };
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    const escrow = this.state.escrowBalances.get(animalId);
    if (!escrow) return { ok: false, value: ERR_ESCROW_NOT_FOUND };
    if (escrow.status !== "active")
      return { ok: false, value: ERR_INVALID_STATUS };
    const key = `${animalId}-${milestoneId}`;
    const milestone = this.state.milestones.get(key);
    if (!milestone) return { ok: false, value: ERR_INVALID_MILESTONE };
    if (!milestone.verified)
      return { ok: false, value: ERR_MILESTONE_NOT_VERIFIED };
    if (milestone.releaseTimestamp !== 0)
      return { ok: false, value: ERR_ALREADY_RELEASED };
    if (this.blockHeight - escrow.lockedTimestamp < this.state.gracePeriod)
      return { ok: false, value: ERR_GRACE_PERIOD_NOT_MET };
    this.stxTransfers.push({
      amount: milestone.amount,
      from: "contract",
      to: milestone.recipient,
    });
    escrow.releasedAmount += milestone.amount;
    milestone.releaseTimestamp = this.blockHeight;
    this.state.fundAllocations.set(key, {
      amountReleased: milestone.amount,
      recipient: milestone.recipient,
      timestamp: this.blockHeight,
    });
    if (escrow.releasedAmount >= escrow.totalAmount) {
      escrow.status = "completed";
    }
    return { ok: true, value: true };
  }

  requestRefund(animalId: number, amount: number): Result<boolean> {
    if (this.state.contractPaused) return { ok: false, value: ERR_PAUSED };
    const escrow = this.state.escrowBalances.get(animalId);
    if (!escrow) return { ok: false, value: ERR_ESCROW_NOT_FOUND };
    if (escrow.status !== "active")
      return { ok: false, value: ERR_INVALID_STATUS };
    if (amount > escrow.totalAmount - escrow.releasedAmount)
      return { ok: false, value: ERR_INSUFFICIENT_FUNDS };
    if (this.blockHeight - escrow.lockedTimestamp > this.state.refundPeriod)
      return { ok: false, value: ERR_REFUND_PERIOD_EXPIRED };
    const key = `${animalId}-${this.caller}`;
    if (this.state.refundRequests.has(key))
      return { ok: false, value: ERR_REFUND_NOT_ALLOWED };
    this.state.refundRequests.set(key, {
      amount,
      requestedTimestamp: this.blockHeight,
      approved: false,
    });
    return { ok: true, value: true };
  }

  approveRefund(animalId: number, donor: string): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    const escrow = this.state.escrowBalances.get(animalId);
    if (!escrow) return { ok: false, value: ERR_ESCROW_NOT_FOUND };
    const key = `${animalId}-${donor}`;
    const request = this.state.refundRequests.get(key);
    if (!request) return { ok: false, value: ERR_REFUND_NOT_ALLOWED };
    if (request.approved) return { ok: false, value: ERR_ALREADY_RELEASED };
    this.stxTransfers.push({
      amount: request.amount,
      from: "contract",
      to: donor,
    });
    escrow.totalAmount -= request.amount;
    request.approved = true;
    if (escrow.totalAmount === escrow.releasedAmount) {
      escrow.status = "cancelled";
    }
    return { ok: true, value: true };
  }

  cancelEscrow(animalId: number): Result<boolean> {
    if (this.caller !== this.state.governanceContract)
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    const escrow = this.state.escrowBalances.get(animalId);
    if (!escrow) return { ok: false, value: ERR_ESCROW_NOT_FOUND };
    if (escrow.status !== "active")
      return { ok: false, value: ERR_INVALID_STATUS };
    if (escrow.releasedAmount > 0)
      return { ok: false, value: ERR_FUNDS_LOCKED };
    this.stxTransfers.push({
      amount: escrow.totalAmount,
      from: "contract",
      to: this.caller,
    });
    escrow.totalAmount = 0;
    escrow.status = "cancelled";
    return { ok: true, value: true };
  }
}

describe("DonationEscrow", () => {
  let contract: DonationEscrowMock;

  beforeEach(() => {
    contract = new DonationEscrowMock();
    contract.reset();
  });

  it("sets governance successfully", () => {
    const result = contract.setGovernance("ST2NEW");
    expect(result.ok).toBe(true);
    expect(contract.state.governanceContract).toBe("ST2NEW");
  });

  it("rejects set governance by non-gov", () => {
    contract.caller = "ST3FAKE";
    const result = contract.setGovernance("ST2NEW");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("sets oracle successfully", () => {
    const result = contract.setOracle("ST3ORACLE");
    expect(result.ok).toBe(true);
    expect(contract.state.oracleContract).toBe("ST3ORACLE");
  });

  it("sets platform fee rate successfully", () => {
    const result = contract.setPlatformFeeRate(10);
    expect(result.ok).toBe(true);
    expect(contract.state.platformFeeRate).toBe(10);
  });

  it("rejects invalid platform fee rate", () => {
    const result = contract.setPlatformFeeRate(101);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_PERCENTAGE);
  });

  it("sets refund period successfully", () => {
    const result = contract.setRefundPeriod(200);
    expect(result.ok).toBe(true);
    expect(contract.state.refundPeriod).toBe(200);
  });

  it("sets max milestones successfully", () => {
    const result = contract.setMaxMilestones(15);
    expect(result.ok).toBe(true);
    expect(contract.state.maxMilestones).toBe(15);
  });

  it("sets min lock amount successfully", () => {
    const result = contract.setMinLockAmount(200);
    expect(result.ok).toBe(true);
    expect(contract.state.minLockAmount).toBe(200);
  });

  it("sets max lock amount successfully", () => {
    const result = contract.setMaxLockAmount(2000000);
    expect(result.ok).toBe(true);
    expect(contract.state.maxLockAmount).toBe(2000000);
  });

  it("pauses contract successfully", () => {
    const result = contract.pauseContract(100);
    expect(result.ok).toBe(true);
    expect(contract.state.contractPaused).toBe(true);
    expect(contract.state.pauseDuration).toBe(100);
  });

  it("unpauses contract successfully", () => {
    contract.pauseContract(100);
    contract.blockHeight = 100;
    const result = contract.unpauseContract();
    expect(result.ok).toBe(true);
    expect(contract.state.contractPaused).toBe(false);
  });

  it("sets grace period successfully", () => {
    const result = contract.setGracePeriod(48);
    expect(result.ok).toBe(true);
    expect(contract.state.gracePeriod).toBe(48);
  });

  it("locks funds successfully", () => {
    contract.animalRegistry.set(1, true);
    const result = contract.lockFunds(1, 1000);
    expect(result.ok).toBe(true);
    const escrow = contract.state.escrowBalances.get(1);
    expect(escrow?.totalAmount).toBe(950);
    expect(contract.stxTransfers).toEqual([
      { amount: 50, from: "ST1TEST", to: "ST1TEST" },
      { amount: 950, from: "ST1TEST", to: "contract" },
    ]);
  });

  it("rejects lock funds if paused", () => {
    contract.pauseContract(100);
    const result = contract.lockFunds(1, 1000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_PAUSED);
  });

  it("rejects lock funds invalid amount", () => {
    const result = contract.lockFunds(1, 50);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_AMOUNT);
  });

  it("adds milestone successfully", () => {
    contract.animalRegistry.set(1, true);
    contract.lockFunds(1, 1000);
    const result = contract.addMilestone(
      1,
      1,
      500,
      "ST4RECIP",
      "Collar deployment"
    );
    expect(result.ok).toBe(true);
    const key = "1-1";
    const milestone = contract.state.milestones.get(key);
    expect(milestone?.amount).toBe(500);
  });

  it("verifies milestone successfully", () => {
    contract.animalRegistry.set(1, true);
    contract.lockFunds(1, 1000);
    contract.addMilestone(1, 1, 500, "ST4RECIP", "Collar deployment");
    contract.caller = contract.state.oracleContract;
    const result = contract.verifyMilestone(1, 1);
    expect(result.ok).toBe(true);
    const key = "1-1";
    const milestone = contract.state.milestones.get(key);
    expect(milestone?.verified).toBe(true);
  });

  it("releases funds successfully", () => {
    contract.animalRegistry.set(1, true);
    contract.lockFunds(1, 1000);
    contract.addMilestone(1, 1, 500, "ST4RECIP", "Collar deployment");
    contract.caller = contract.state.oracleContract;
    contract.verifyMilestone(1, 1);
    contract.caller = contract.state.governanceContract;
    contract.blockHeight = 24;
    const result = contract.releaseFunds(1, 1);
    expect(result.ok).toBe(true);
    const escrow = contract.state.escrowBalances.get(1);
    expect(escrow?.releasedAmount).toBe(500);
    expect(contract.stxTransfers[2]).toEqual({
      amount: 500,
      from: "contract",
      to: "ST4RECIP",
    });
  });

  it("requests refund successfully", () => {
    contract.animalRegistry.set(1, true);
    contract.lockFunds(1, 1000);
    const result = contract.requestRefund(1, 400);
    expect(result.ok).toBe(true);
    const key = "1-ST1TEST";
    const request = contract.state.refundRequests.get(key);
    expect(request?.amount).toBe(400);
  });

  it("approves refund successfully", () => {
    contract.animalRegistry.set(1, true);
    contract.lockFunds(1, 1000);
    contract.requestRefund(1, 400);
    const result = contract.approveRefund(1, "ST1TEST");
    expect(result.ok).toBe(true);
    const escrow = contract.state.escrowBalances.get(1);
    expect(escrow?.totalAmount).toBe(550);
    expect(contract.stxTransfers[2]).toEqual({
      amount: 400,
      from: "contract",
      to: "ST1TEST",
    });
  });

  it("cancels escrow successfully", () => {
    contract.animalRegistry.set(1, true);
    contract.lockFunds(1, 1000);
    const result = contract.cancelEscrow(1);
    expect(result.ok).toBe(true);
    const escrow = contract.state.escrowBalances.get(1);
    expect(escrow?.totalAmount).toBe(0);
    expect(escrow?.status).toBe("cancelled");
    expect(contract.stxTransfers[2]).toEqual({
      amount: 950,
      from: "contract",
      to: "ST1TEST",
    });
  });
});
