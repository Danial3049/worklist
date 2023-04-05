import _ from "lodash";

export default class Utils {
  static getIndexToArray = (array: any[], value: any): number => {
    if (array == null || value == null) return -1;

    const result = _.findIndex(array, (item) => item === value);

    return result;
  };
}
