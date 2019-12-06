"use strict";

const { assert } = require("chai");
const { describe, specify } = require("mocha-sugar-free");

const { JSDOM } = require("../..");

describe("htmlinputelement", () => {
  specify("html input should handle value/defaultValue correctly", () => {
    const input = (new JSDOM("<input>")).window.document.querySelector("input");

    assert.strictEqual(input.value, "", "value should equal empty string if uninitialized");
    assert.strictEqual(input.defaultValue, "", "defaultValue should equal empty string if uninitialized");
    assert.strictEqual(input.getAttribute("value"), null, "value attribute should be null (uninitialized)");

    input.defaultValue = "abc";

    assert.strictEqual(
      input.value, "abc",
      "setting the defaultValue should also change the value if \"dirty value\" is false"
    );
    assert.strictEqual(input.defaultValue, "abc", "defaultValue should equal to set string");
    assert.strictEqual(input.getAttribute("value"), "abc", "value attribute should equal to set string");

    input.value = "def";
    // dirtyValue is now true

    assert.strictEqual(input.value, "def", "value should get changed by setter");
    assert.strictEqual(input.defaultValue, "abc", "defaultValue should equal to set string");
    assert.strictEqual(input.getAttribute("value"), "abc", "value attribute should not change");

    input.defaultValue = "abc2";

    assert.strictEqual(input.value, "def", "value should not change by setting defaultValue is dirtyValue is set");
    assert.strictEqual(input.defaultValue, "abc2", "defaultValue should equal to set string");

    input.value = null;

    assert.strictEqual(input.value, "", "setting value to null should result in an empty string");
    assert.strictEqual(input.getAttribute("value"), "abc2", "value attribute should not change");
  });

  specify("html input should handle checked/defaultChecked correctly", () => {
    const checked = (new JSDOM()).window.document.createElement("input");

    assert.strictEqual(checked.checked, false, "checkedness is false by default");

    checked.setAttribute("checked", "checked");
    assert.strictEqual(checked.checked, true, "checked property must return the current checkedness");

    checked.removeAttribute("checked");
    assert.strictEqual(
      checked.checked, false,
      "dirty checkedness is still false, the checkedness should have been changed"
    );

    checked.checked = false; // sets the element"s dirty checkedness flag to true
    assert.strictEqual(
      checked.checked, false,
      "on setting, the checked property must set the element's checkedness to the new value"
    );

    checked.setAttribute("checked", "checked");
    assert.strictEqual(
      checked.checked, false,
      "checkedness should not have been changed because dirty checkedness is now true"
    );
  });

  specify("uncheck other radio buttons in the same group", () => {
    const doc = (new JSDOM()).window.document;
    const form = doc.createElement("form");
    const div = doc.createElement("div");
    const radioA = doc.createElement("input");
    const radioB = doc.createElement("input");
    const radioC = doc.createElement("input");
    const checkD = doc.createElement("input");
    radioA.type = "radio";
    radioB.type = "radio";
    radioC.type = "radio";
    checkD.type = "checkbox";
    radioA.name = "foo";
    radioB.name = "foo";
    radioC.name = "foo";
    checkD.name = "foo";

    div.appendChild(radioA);
    div.appendChild(radioB);
    // not yet C
    div.appendChild(checkD);

    checkD.checked = true;
    radioA.checked = true;
    radioB.checked = true;

    assert.strictEqual(radioA.checked, false, "Setting checked on a radio should uncheck others in the same group");
    assert.strictEqual(radioB.checked, true, "Last radio to be set should be checked");
    assert.strictEqual(checkD.checked, true, "Radio\"s should not affect the checkedness of checkboxes");

    radioA.checked = true;
    form.appendChild(radioA);
    assert.strictEqual(radioA.checked, true, "Just checked this");
    radioB.checked = true;
    form.appendChild(radioB);
    assert.strictEqual(radioB.checked, true, "Just checked this");
    assert.strictEqual(radioA.checked, false, "Changing the form owner should uncheck others");

    form.appendChild(radioC);
    radioC.name = "bar";
    radioA.checked = true;
    radioC.checked = true;
    assert.strictEqual(radioA.checked, true, "Just checked this");
    assert.strictEqual(radioC.checked, true, "Just checked this");
    radioC.name = "foo";
    assert.strictEqual(radioA.checked, false, "Changing the name should uncheck others");
    assert.strictEqual(radioC.checked, true, "Changing the name not uncheck itself");

    form.appendChild(checkD);
    radioC.checked = true;
    checkD.checked = true;
    assert.strictEqual(radioC.checked, true, "Just checked this");
    checkD.type = "radio";
    assert.strictEqual(radioC.checked, false, "Changing the type should uncheck others");
    assert.strictEqual(checkD.checked, true, "Changing the name not uncheck itself");
  });

  specify(
    "inputs should default to type text on the property, despite having no attribute",
    () => {
      const doc = (new JSDOM(`<html><head></head><body><input id="input" /></body></html>`)).window.document;
      const inputEl = doc.getElementById("input");

      assert.equal(inputEl.hasAttribute("type"), false);
      assert.equal(inputEl.getAttribute("type"), null);
      assert.equal(inputEl.type, "text");
    }
  );

  specify("setting an input's type property should set its type attribute", () => {
    const doc = (new JSDOM(`<html><head></head><body><input id="input" /></body></html>`)).window.document;
    const inputEl = doc.getElementById("input");
    inputEl.type = "checkbox";

    assert.equal(inputEl.getAttribute("type"), "checkbox");
  });

  specify(
    "an input's parsed type attribute should be reflected in both its property and attribute",
    () => {
      const doc = (new JSDOM(`<input id="input" type="checkbox" />`)).window.document;
      const inputEl = doc.getElementById("input");

      assert.equal(inputEl.type, "checkbox");
      assert.equal(inputEl.getAttribute("type"), "checkbox");
    }
  );
  specify(
    "input types that accepts valueAsDate shoutld be able to handle setting and getting it correctly",
    () => {
      const date = new Date("Mon Dec 05 2019 08:15:00 GMT+0200 (Eastern European Standard Time)");

      const input = (new JSDOM()).window.document.createElement("input");
      input.type = "date";
      input.valueAsDate = date;
      assert.equal(input.value, "2019-12-05");

      const dateInputValueAsDate = input.valueAsDate;
      const expectedValueForDate = new Date("Mon Dec 05 2019 02:00:00 GMT+0200 (Eastern European Standard Time)");
      assert.equal(dateInputValueAsDate.getFullYear(), expectedValueForDate.getFullYear());
      assert.equal(dateInputValueAsDate.getMonth(), expectedValueForDate.getMonth());
      assert.equal(dateInputValueAsDate.getDate(), expectedValueForDate.getDate());
      assert.equal(dateInputValueAsDate.getHours(), expectedValueForDate.getHours());
      assert.equal(dateInputValueAsDate.getMinutes(), expectedValueForDate.getMinutes());
      assert.equal(dateInputValueAsDate.getSeconds(), expectedValueForDate.getSeconds());
      assert.equal(dateInputValueAsDate.getMilliseconds(), expectedValueForDate.getMilliseconds());


      input.type = "month";
      input.valueAsDate = date;
      assert.equal(input.value, "2019-12");

      const monthValueAsDate = input.valueAsDate;
      const expectedValueForMonth = new Date("Sun Dec 01 2019 02:00:00 GMT+0200 (Eastern European Standard Time)");

      assert.equal(monthValueAsDate.getFullYear(), expectedValueForMonth.getFullYear());
      assert.equal(monthValueAsDate.getMonth(), expectedValueForMonth.getMonth());
      assert.equal(monthValueAsDate.getDate(), expectedValueForMonth.getDate());
      assert.equal(monthValueAsDate.getHours(), expectedValueForMonth.getHours());
      assert.equal(monthValueAsDate.getMinutes(), expectedValueForMonth.getMinutes());
      assert.equal(monthValueAsDate.getSeconds(), expectedValueForMonth.getSeconds());
      assert.equal(monthValueAsDate.getMilliseconds(), expectedValueForMonth.getMilliseconds());


      input.type = "week";
      input.valueAsDate = date;
      assert.equal(input.value, "2019-W49");

      const weekValueAsDate = input.valueAsDate;
      const expectedValueForWeek = new Date("Mon Dec 02 2019 00:00:00 GMT+0200 (Eastern European Standard Time)");

      assert.equal(weekValueAsDate.getFullYear(), expectedValueForWeek.getFullYear());
      assert.equal(weekValueAsDate.getMonth(), expectedValueForWeek.getMonth());
      assert.equal(weekValueAsDate.getDate(), expectedValueForWeek.getDate());
      assert.equal(weekValueAsDate.getHours(), expectedValueForWeek.getHours());
      assert.equal(weekValueAsDate.getMinutes(), expectedValueForWeek.getMinutes());
      assert.equal(weekValueAsDate.getSeconds(), expectedValueForWeek.getSeconds());
      assert.equal(weekValueAsDate.getMilliseconds(), expectedValueForWeek.getMilliseconds());

      input.type = "time";
      input.valueAsDate = date;
      assert.equal(input.value, "08:15");

      const timeValueAsDate = input.valueAsDate;
      const expectedValueForTime = new Date("Thu Jan 01 1970 08:15:00 GMT+0200 (Eastern European Standard Time)");

      assert.equal(timeValueAsDate.getFullYear(), expectedValueForTime.getFullYear());
      assert.equal(timeValueAsDate.getMonth(), expectedValueForTime.getMonth());
      assert.equal(timeValueAsDate.getDate(), expectedValueForTime.getDate());
      assert.equal(timeValueAsDate.getHours(), expectedValueForTime.getHours());
      assert.equal(timeValueAsDate.getMinutes(), expectedValueForTime.getMinutes());
      assert.equal(timeValueAsDate.getSeconds(), expectedValueForTime.getSeconds());
      assert.equal(timeValueAsDate.getMilliseconds(), expectedValueForTime.getMilliseconds());
    }
  );
});
