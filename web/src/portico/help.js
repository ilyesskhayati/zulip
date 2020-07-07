import ClipboardJS from "clipboard";
import $ from "jquery";
import SimpleBar from "simplebar";
import tippy from "tippy.js";

import copy_to_clipboard_svg from "../../templates/copy_to_clipboard_svg.hbs";
import * as common from "../common";

import {activate_correct_tab} from "./tabbed-instructions";

function register_code_section($code_section) {
    const $li = $code_section.find("ul.nav li");
    const $blocks = $code_section.find(".blocks div");

    $li.on("click", function () {
        const tab_key = this.dataset.tabKey;

        $li.removeClass("active");
        $li.filter("[data-tab-key=" + tab_key + "]").addClass("active");

        $blocks.removeClass("active");
        $blocks.filter("[data-tab-key=" + tab_key + "]").addClass("active");
    });

    $li.on("keydown", (e) => {
        if (e.key === "Enter") {
            e.target.click();
        }
    });
}

// Display the copy-to-clipboard button inside the .codehilite element
// within the API and Help Center docs using clipboard.js
function add_copy_to_clipboard_element($codehilite) {
    const $copy_button = $("<button>").addClass("copy-codeblock");
    $copy_button.html(copy_to_clipboard_svg());

    $($codehilite).append($copy_button);

    const clipboard = new ClipboardJS($copy_button[0], {
        text(copy_element) {
            // trim to remove trailing whitespace introduced
            // by additional elements inside <pre>
            return $(copy_element).siblings("pre").text().trim();
        },
    });

    // Show a tippy tooltip when the button is hovered
    const tooltip_copy = tippy($copy_button[0], {
        content: "Copy code",
        trigger: "mouseenter",
        placement: "top",
    });

    // Show a tippy tooltip when the code is copied
    const tooltip_copied = tippy($copy_button[0], {
        content: "Copied!",
        trigger: "manual",
        placement: "top",
    });

    // Copy code on button click
    $copy_button.on("click", () => {
        clipboard.onClick({currentTarget: $copy_button[0]});
    });

    // Show "Copied!" tooltip when code is successfully copied
    clipboard.on("success", () => {
        tooltip_copy.hide();
        tooltip_copied.show();

        // Hide the "Copied!" tooltip after 1 second
        setTimeout(() => {
            tooltip_copied.hide();
        }, 1000);
    });
}

function highlight_current_article() {
    $(".help .sidebar a").removeClass("highlighted");
    $(".help .sidebar a").attr("tabindex", "0");
    const path = window.location.pathname;

    if (!path) {
        return;
    }

    const hash = window.location.hash;
    let $article = $(`.help .sidebar a[href="${CSS.escape(path + hash)}"]`);
    if (!$article.length) {
        // If there isn't an entry in the left sidebar that matches
        // the full URL+hash pair, instead highlight an entry in the
        // left sidebar that just matches the URL part.
        $article = $(`.help .sidebar a[href="${CSS.escape(path)}"]`);
    }
    // Highlight current article link and the heading of the same
    $article.closest("ul").css("display", "block");
    $article.addClass("highlighted");
    $article.attr("tabindex", "-1");
}

function render_code_sections() {
    $(".code-section").each(function () {
        activate_correct_tab($(this));
        register_code_section($(this));
    });

    // Add a copy-to-clipboard button for each .codehilite element
    $(".markdown .codehilite").each(function () {
        add_copy_to_clipboard_element($(this));
    });

    highlight_current_article();

    common.adjust_mac_kbd_tags(".markdown kbd");

    $("table").each(function () {
        $(this).addClass("table table-striped");
    });
}

new SimpleBar($(".markdown")[0]);
new SimpleBar($(".sidebar")[0]);

// Remove ID attributes from sidebar links so they don't conflict with index page anchor links
$(".help .sidebar h1, .help .sidebar h2, .help .sidebar h3").removeAttr("id");

// Scroll to anchor link when clicked. Note that landing-page.js has a
// similar function; this file and landing-page.js are never included
// on the same page.
$(document).on(
    "click",
    ".markdown .content h1, .markdown .content h2, .markdown .content h3",
    function () {
        window.location.hash = $(this).attr("id");
    },
);

$(".hamburger").on("click", () => {
    $(".sidebar").toggleClass("show");
    $(".sidebar .simplebar-content-wrapper").css("overflow", "hidden scroll");
    $(".sidebar .simplebar-vertical").css("visibility", "visible");
});

$(".markdown").on("click", () => {
    if ($(".sidebar.show").length) {
        $(".sidebar.show").toggleClass("show");
    }
});

render_code_sections();

$("body").addClass("noscroll");

$(".highlighted")[0]?.scrollIntoView({block: "center"});
