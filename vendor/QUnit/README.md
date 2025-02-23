# ADR
QUnit is published in the repository rather than fetched from its original repository. The main reason is that it allows us to modify the code according to our needs.

In this case, we want to display the QUnit reporter besides the app's user interface. This requires modifying the CSS. We may also modify QUnit's JS if necessary.