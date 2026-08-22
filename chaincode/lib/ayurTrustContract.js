'use strict';

const { Contract } = require('fabric-contract-api');

class AyurTrustContract extends Contract {

    async InitLedger(ctx) {
        console.info('AyurTrust ledger initialized');
        return;
    }

    async CreateBatch(ctx, batchId, dataJson, ipfsHash) {
        const exists = await this.BatchExists(ctx, batchId);
        if (exists) {
            throw new Error(`Batch ${batchId} already exists`);
        }

        let parsedData;
        try {
            parsedData = JSON.parse(dataJson);
        } catch (err) {
            throw new Error(`Invalid data JSON: ${err.message}`);
        }

        const txTimestamp = ctx.stub.getTxTimestamp();
        const committedAt = new Date(txTimestamp.seconds.low * 1000).toISOString();

        const batch = {
            docType: 'batch',
            batchId,
            data: parsedData,
            ipfsHash,
            committedAt,
        };

        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    async ReadBatch(ctx, batchId) {
        const batchBytes = await ctx.stub.getState(batchId);
        if (!batchBytes || batchBytes.length === 0) {
            throw new Error(`Batch ${batchId} does not exist`);
        }
        return batchBytes.toString();
    }

    async BatchExists(ctx, batchId) {
        const batchBytes = await ctx.stub.getState(batchId);
        return batchBytes && batchBytes.length > 0;
    }

    async GetAllBatches(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }
}

module.exports = AyurTrustContract;
