import { DateTime } from 'luxon';
import { CalculateTimestampDiffOptions, FormatDateOptions, FormatNumberOptions, ISOFormatDateOptions } from '../interfaces/format.interface';
export declare class FormatService {
    /**
     * @Descripción: Return number with format
     * @Param _options {FormatNumberOptions}
     * @return: string
     */
    formatNumber(_options: FormatNumberOptions): string;
    /**
     * @Descripción: Return luxon DateTime instance
     * @return: DateTime
     */
    dateTimeRef(): typeof DateTime;
    /**
     * @Descripción: Return date with format
     * @Param _options {FormatDateOptions}
     * @return: string
     */
    formatDate(_options: FormatDateOptions): string;
    /**
     * @Descripción: Return convert date to ISO
     * @Param _options {ISOFormatDateOptions}
     * @return: string
     */
    dateToISO(_options: ISOFormatDateOptions): string;
    /**
     * @Descripción: Return diff between two timestamps
     * @Param _options {CalculateTimestampDiffOptions}
     * @return: string | number
     */
    calculateTimestampDiff(_options: CalculateTimestampDiffOptions): number | string;
}
