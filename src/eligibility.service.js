class EligibilityService {
  /**
   * Compare cart data with criteria to compute eligibility.
   * If all criteria are fulfilled then the cart is eligible (return true).
   *
   * @param cart
   * @param criteria
   * @return {boolean}
   */
  isEligible(cart, criteria) {
    for (const key in criteria) {
      if (!criteria.hasOwnProperty(key)) continue;

      const cartValue = this.getNestedValue(cart, key);
      const criteriaValue = criteria[key];

      if (!this.isConditionFulfilled(cartValue, criteriaValue)) {
        return false;
      }
    }

    return true;
  }

  getNestedValue(obj, key) {
    return key.split(".").reduce((value, keyPart) => {
      if (value && typeof value === "object") {
        return Array.isArray(value)
          ? value.map((subObj) => subObj[keyPart])
          : value[keyPart];
      }
      return undefined;
    }, obj);
  }

  isConditionFulfilled(cartValue, criteriaValue) {
    if (cartValue === undefined) return false;

    // Handling arrays: Check if any element in the array fulfills the condition
    if (Array.isArray(cartValue)) {
      return cartValue.some((element) =>
        this.isConditionFulfilled(element, criteriaValue)
      );
    }

    if (typeof criteriaValue === "object" && criteriaValue !== null) {
      if (criteriaValue.hasOwnProperty("gt")) {
        return cartValue > criteriaValue.gt;
      } else if (criteriaValue.hasOwnProperty("lt")) {
        return cartValue < criteriaValue.lt;
      } else if (criteriaValue.hasOwnProperty("gte")) {
        return cartValue >= criteriaValue.gte;
      } else if (criteriaValue.hasOwnProperty("lte")) {
        return cartValue <= criteriaValue.lte;
      } else if (criteriaValue.hasOwnProperty("in")) {
        return criteriaValue.in.includes(cartValue);
      } else if (criteriaValue.hasOwnProperty("and")) {
        return Object.keys(criteriaValue.and).every((key) =>
          this.isConditionFulfilled(cartValue, {
            [key]: criteriaValue.and[key],
          })
        );
      } else if (criteriaValue.hasOwnProperty("or")) {
        return Object.keys(criteriaValue.or).some((key) =>
          this.isConditionFulfilled(cartValue, { [key]: criteriaValue.or[key] })
        );
      }
    }

    return cartValue == criteriaValue;
  }
}

module.exports = {
  EligibilityService,
};
