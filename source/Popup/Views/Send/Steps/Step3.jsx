import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import extension from 'extensionizer';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import {
  Container,
  InfoRow,
  Button,
  AssetFormat,
  USDFormat,
} from '@ui';
import { setAssets, setAssetsLoading } from '@redux/wallet';
import { Typography } from '@material-ui/core';
import PlugController from '@psychedelic/plug-controller';
import { Principal } from '@dfinity/principal';

import { useRouter, TokenIcon, TABS } from '@components';
import { ADDRESS_TYPES, DEFAULT_ICP_FEE, XTC_FEE } from '@shared/constants/addresses';
import { HANDLER_TYPES, sendMessage } from '@background/Keyring';
import { useICPPrice } from '@redux/icp';
import { validatePrincipalId } from '@shared/utils/ids';
import { icIdsUrl } from '@shared/constants/urls';

import useStyles from '../styles';
import AddressTranslation from './AddressTranslation';

const getAddressTranslations = (address, addressInfo, symbol) => {
  const translations = [{ address, type: addressInfo.type }];
  /**
   * Cases:
   * 1. address is a principal and symbol is ICP ------> should translate to accountId [leaf]
   * 2. address is a principal and symbol is not ICP or is accountId  ---> No translation [leaf]
   * 3. address is an ICNS name ------> should translate to principalId and recheck (1) and (2)
   */
  if (addressInfo?.type === ADDRESS_TYPES.ICNS) {
    const icnsInfo = {
      address: addressInfo.resolvedAddress,
      type: validatePrincipalId(addressInfo.resolvedAddress)
        ? ADDRESS_TYPES.PRINCIPAL
        : ADDRESS_TYPES.ACCOUNT,
    };
    const subtranslations = getAddressTranslations(addressInfo.resolvedAddress, icnsInfo, symbol);
    translations.push(subtranslations.pop()); // Only append final translation
  } else if (addressInfo?.type === ADDRESS_TYPES.PRINCIPAL && symbol === 'ICP') {
    const accountId = PlugController.getAccountId(
      Principal.fromText(address),
    );
    translations.push({ address: accountId, type: ADDRESS_TYPES.ACCOUNT });
  }
  return translations;
};

const Step3 = ({
  asset, amount, address, addressInfo, handleSendClick, error, isTrxCompleted,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { navigator } = useRouter();
  const isICP = asset?.symbol === 'ICP';
  const isXTC = asset?.symbol === 'XTC';
  const dispatch = useDispatch();
  const icpPrice = useICPPrice();

  const subtotal = amount * asset?.price;
  const fee = +(asset?.price * DEFAULT_ICP_FEE).toFixed(5);
  const xtcFee = +(asset?.price * XTC_FEE).toFixed(5);

  const onClick = () => {
    setLoading(true);
    handleSendClick();
  };

  const openTwoIdsBlog = () => {
    if (!loading) {
      extension.tabs.create({ url: icIdsUrl });
    }
  };

  useEffect(() => {
    if (error) {
      navigator.navigate('error');
    }
  }, [error]);

  useEffect(() => {
    if (isTrxCompleted) {
      dispatch(setAssetsLoading(true));
      sendMessage({
        type: HANDLER_TYPES.GET_ASSETS,
        params: { refresh: true },
      }, (keyringAssets) => {
        dispatch(setAssets({ keyringAssets, icpPrice }));
        dispatch(setAssetsLoading(false));
      });

      setLoading(false);
      navigator.navigate('home', TABS.ACTIVITY);
    }
  }, [isTrxCompleted]);

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12} style={{ textAlign: 'center' }}>
          <div className={classes.asset}>
            <TokenIcon image={asset.image} className={classes.image} symbol={asset.symbol} />
            <Typography variant="h1">
              <AssetFormat value={amount} asset={asset?.symbol} />
            </Typography>
          </div>
          {asset?.price && (
            <Typography variant="subtitle1">
              <USDFormat value={subtotal} />
            </Typography>
          )}
        </Grid>
        <AddressTranslation
          addresses={getAddressTranslations(address, addressInfo, asset?.symbol)}
        />
        {
          asset.symbol === 'ICP' && addressInfo.type !== ADDRESS_TYPES.ACCOUNT
          && (
          <Grid item xs={12}>
            <div className={classes.alertContainer}>
              <span>{t('send.icpAlertText')}</span>
              <span
                className={classes.alertButton}
                onClick={openTwoIdsBlog}
              >
                {t('send.icpAlertButton')}
              </span>
            </div>
          </Grid>
          )
        }
        {isICP && (
          <Grid item xs={12}>
            <InfoRow name={t('common.taxFee')} value={`${DEFAULT_ICP_FEE} ICP ($${fee})`} />
          </Grid>
        )}
        {isXTC && (
          <Grid item xs={12}>
            <InfoRow name={t('common.taxFee')} value={`${XTC_FEE} XTC ($${xtcFee})`} />
          </Grid>
        )}
        {asset?.price && (
          <Grid item xs={12}>
            <InfoRow name={t('common.total')} value={<USDFormat value={subtotal + fee} />} total />
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            variant="rainbow"
            value={t('send.title')}
            onClick={onClick}
            fullWidth
            loading={loading}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

Step3.propTypes = {
  asset: PropTypes.objectOf(PropTypes.object).isRequired,
  amount: PropTypes.number.isRequired,
  address: PropTypes.string.isRequired,
  addressInfo: PropTypes.objectOf(PropTypes.object).isRequired,
  handleSendClick: PropTypes.func.isRequired,
  error: PropTypes.bool,
  isTrxCompleted: PropTypes.bool.isRequired,
};

Step3.defaultProps = {
  error: false,
};

export default Step3;
