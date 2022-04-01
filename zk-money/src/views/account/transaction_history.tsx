import { getAssetPreferredFractionalDigits } from 'alt-model/known_assets/known_asset_display_data';
import { useRemoteAssets } from 'alt-model/top_level_context';
import React, { Fragment, useState } from 'react';
import styled, { css } from 'styled-components/macro';
import { Section, SectionTitle } from 'ui-components';
import { AccountTx, formatBaseUnits, JoinSplitTx } from '../../app';
import { AccountTxSummary, JoinSplitTxSummary, Pagination } from '../../components';
import { spacings } from '../../styles';

const summaryRowStyle = css`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 15px 40px;
  letter-spacing: 0.1em;
  margin: 20px 0;
  height: 66px;
`;

const JoinSplitTxSummaryRow = styled(JoinSplitTxSummary)`
  ${summaryRowStyle}
`;

const AccountTxSummaryRow = styled(AccountTxSummary)`
  ${summaryRowStyle}
`;

const PaginationRoot = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${spacings.m};
`;

interface TransactionHistoryProps {
  accountTxs: AccountTx[];
  joinSplitTxs: JoinSplitTx[];
  txsPublishTime?: Date;
  txsPerPage?: number;
}

export const TransactionHistory: React.FunctionComponent<TransactionHistoryProps> = ({
  accountTxs,
  joinSplitTxs,
  txsPublishTime,
  txsPerPage = 5,
}) => {
  const remoteAssets = useRemoteAssets();
  const [page, setPage] = useState(1);
  const numJs = joinSplitTxs.length;
  const numAc = accountTxs.length;

  return (
    <Section>
      <SectionTitle label="Transaction History" />
      {joinSplitTxs.slice((page - 1) * txsPerPage, page * txsPerPage).map((tx, idx) => {
        const asset = remoteAssets?.find(x => x.id === tx.assetId);
        if (!asset) return <Fragment key={idx} />;
        return (
          <JoinSplitTxSummaryRow
            key={tx.txId.toString()}
            txId={tx.txId.toString()}
            action={tx.action}
            value={formatBaseUnits(tx.balanceDiff, asset.decimals, {
              precision: getAssetPreferredFractionalDigits(asset.address),
              commaSeparated: true,
              showPlus: true,
            })}
            symbol={asset.symbol}
            link={tx.link}
            publishTime={txsPublishTime}
            settled={tx.settled}
          />
        );
      })}
      {accountTxs
        .slice(Math.max(0, (page - 1) * txsPerPage - numJs), Math.max(0, page * txsPerPage - numJs))
        .map(tx => (
          <AccountTxSummaryRow
            key={tx.txId.toString()}
            txId={tx.txId.toString()}
            action={tx.action}
            link={tx.link}
            publishTime={txsPublishTime}
            settled={tx.settled}
          />
        ))}
      {numJs >= txsPerPage && (
        <PaginationRoot>
          <Pagination totalItems={numJs + numAc} page={page} itemsPerPage={txsPerPage} onChangePage={setPage} />
        </PaginationRoot>
      )}
    </Section>
  );
};
