(function () {
    'use strict';

    var CART_STORAGE_KEY = 'monilla_cart_items';
    var CART_OWNER_KEY = 'monilla_cart_owner';
    var ORDER_NOTES_KEY = 'monilla_order_notes';
    var DELIVERY_FORM_KEY = 'monilla_delivery_info';
    var DELIVERY_FEE_PER_PIECE = 5;
    var currentUser = null;
    var backendBase = '';
    var DEFAULT_PRICE_BY_ID = {
        'conventional-design': 170,
        'v-cut-design': 170,
        'shiplap-design': 170
    };

    function getBackendBasePath() {
        var path = (window.location.pathname || '').toLowerCase();
        if (path.indexOf('/admin/') !== -1) {
            return '../';
        }
        return '';
    }

    function formatCurrency(amount) {
        var value = Number(amount) || 0;
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(value);
    }

    function getFallbackPrice(id) {
        return Number(DEFAULT_PRICE_BY_ID[id]) || 0;
    }

    function normalizeCartItem(item) {
        var safeItem = item || {};
        var safeId = safeItem.id || '';
        var safePrice = Number(safeItem.price);
        var safeQuantity = Math.max(1, Number(safeItem.quantity) || 1);

        if (!Number.isFinite(safePrice) || safePrice <= 0) {
            safePrice = getFallbackPrice(safeId);
        }

        return {
            id: safeId,
            title: safeItem.title || 'Product',
            type: safeItem.type || 'Precast Block',
            image: safeItem.image || 'images/home_product/conventional.png',
            price: safePrice,
            quantity: safeQuantity
        };
    }

    function readCart() {
        try {
            var raw = localStorage.getItem(CART_STORAGE_KEY);
            if (!raw) return [];
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.map(normalizeCartItem);
        } catch (err) {
            return [];
        }
    }

    function writeCart(items) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }

    function getCartOwner() {
        return localStorage.getItem(CART_OWNER_KEY);
    }

    function setCartOwner(owner) {
        localStorage.setItem(CART_OWNER_KEY, owner);
    }

    function persistCart(items) {
        writeCart(items);

        if (currentUser && currentUser.id) {
            setCartOwner(String(currentUser.id));
            saveServerCart(items).catch(function () {
                // Keep local cart functional even if sync fails.
            });
            return;
        }

        setCartOwner('guest');
    }

    async function fetchCurrentUser() {
        try {
            var response = await fetch(backendBase + 'backend/me.php', {
                credentials: 'same-origin'
            });

            if (!response.ok) {
                return null;
            }

            var payload = await response.json();
            if (payload && payload.authenticated && payload.user) {
                return payload.user;
            }
        } catch (err) {
            return null;
        }

        return null;
    }

    async function fetchServerCart() {
        if (!currentUser || !currentUser.id) {
            return [];
        }

        try {
            var response = await fetch(backendBase + 'backend/cart.php', {
                method: 'GET',
                credentials: 'same-origin'
            });

            if (!response.ok) {
                return [];
            }

            var payload = await response.json();
            if (!payload || !Array.isArray(payload.items)) {
                return [];
            }

            return payload.items.map(normalizeCartItem);
        } catch (err) {
            return [];
        }
    }

    async function saveServerCart(items) {
        if (!currentUser || !currentUser.id) {
            return;
        }

        await fetch(backendBase + 'backend/cart.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: items })
        });
    }

    function mergeCartCollections(primaryItems, secondaryItems) {
        var itemMap = new Map();

        function mergeOne(item) {
            var normalized = normalizeCartItem(item);
            if (!normalized.id) {
                return;
            }

            var existing = itemMap.get(normalized.id);
            if (!existing) {
                itemMap.set(normalized.id, normalized);
                return;
            }

            existing.quantity += normalized.quantity;
            if ((!existing.price || existing.price <= 0) && normalized.price > 0) {
                existing.price = normalized.price;
            }
            if (!existing.image && normalized.image) {
                existing.image = normalized.image;
            }
            if (!existing.title && normalized.title) {
                existing.title = normalized.title;
            }
            if (!existing.type && normalized.type) {
                existing.type = normalized.type;
            }
        }

        primaryItems.forEach(mergeOne);
        secondaryItems.forEach(mergeOne);

        return Array.from(itemMap.values());
    }

    function getTotalQuantity(items) {
        return items.reduce(function (total, item) {
            return total + (Number(item.quantity) || 0);
        }, 0);
    }

    function getSubtotal(items) {
        return items.reduce(function (total, item) {
            var unitPrice = Number(item.price) || 0;
            var qty = Number(item.quantity) || 0;
            return total + (unitPrice * qty);
        }, 0);
    }

    function updateCartBadge() {
        var badge = document.getElementById('cartBadge');
        if (!badge) return;

        var items = readCart();
        var totalQty = getTotalQuantity(items);
        badge.textContent = String(totalQty);
        badge.classList.toggle('hidden', totalQty <= 0);
    }

    function getProductData(button) {
        var card = button.closest('.product-card');
        var fallbackTitle = card ? card.querySelector('.product-card-title') : null;
        var fallbackImg = card ? card.querySelector('.product-card-img') : null;

        var id = button.getAttribute('data-id') || (button.getAttribute('data-title') || '').toLowerCase().replace(/\s+/g, '-');

        return {
            id: id,
            title: button.getAttribute('data-title') || (fallbackTitle ? fallbackTitle.textContent.trim() : 'Product'),
            type: button.getAttribute('data-type') || '',
            image: button.getAttribute('data-img') || (fallbackImg ? fallbackImg.getAttribute('src') : ''),
            price: Number(button.getAttribute('data-price')) || getFallbackPrice(id),
            quantity: 1
        };
    }

    function addToCart(product) {
        var items = readCart();
        var existing = items.find(function (item) {
            return item.id === product.id;
        });

        if (existing) {
            existing.quantity += 1;
            if (!existing.price || existing.price <= 0) {
                existing.price = product.price;
            }
        } else {
            items.push(product);
        }

        persistCart(items);
        updateCartBadge();
    }

    function showAddedState(button) {
        var original = button.textContent;
        button.textContent = 'Added!';
        button.classList.add('added');

        window.setTimeout(function () {
            button.textContent = original;
            button.classList.remove('added');
        }, 900);
    }

    function bindHeaderCartButton() {
        var cartBtn = document.getElementById('cartBtn');
        if (!cartBtn) return;

        cartBtn.addEventListener('click', function () {
            if (window.location.pathname.toLowerCase().indexOf('cart.html') !== -1) {
                return;
            }
            window.location.href = 'cart.html';
        });
    }

    function bindAddToCartButtons() {
        var buttons = document.querySelectorAll('.add-to-cart-btn');
        if (!buttons.length) return;

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var product = getProductData(button);
                addToCart(product);
                showAddedState(button);
            });
        });
    }

    function updateCartSummary(items) {
        var totalItemsNode = document.getElementById('cartTotalItems');
        var totalTypesNode = document.getElementById('cartTotalTypes');
        var subtotalNode = document.getElementById('cartSubtotal');
        var deliveryFeeNode = document.getElementById('cartDeliveryFee');
        var grandTotalNode = document.getElementById('cartGrandTotal');
        var totalQty = getTotalQuantity(items);
        var subtotal = getSubtotal(items);
        var deliveryFee = totalQty * DELIVERY_FEE_PER_PIECE;
        var grandTotal = subtotal + deliveryFee;

        if (totalItemsNode) totalItemsNode.textContent = String(totalQty);
        if (totalTypesNode) totalTypesNode.textContent = String(items.length);
        if (subtotalNode) subtotalNode.textContent = formatCurrency(subtotal);
        if (deliveryFeeNode) deliveryFeeNode.textContent = formatCurrency(deliveryFee);
        if (grandTotalNode) grandTotalNode.textContent = formatCurrency(grandTotal);
    }

    function bindOrderNotes() {
        var notesNode = document.getElementById('cartOrderNotes');
        if (!notesNode) return;

        notesNode.value = localStorage.getItem(ORDER_NOTES_KEY) || '';

        notesNode.addEventListener('input', function () {
            localStorage.setItem(ORDER_NOTES_KEY, notesNode.value || '');
        });
    }

    function bindDeliveryInfoForm() {
        var card = document.getElementById('deliveryInfoCard');
        if (!card) return;

        var modeButtons = Array.from(card.querySelectorAll('.delivery-mode-btn'));
        var paymentButtons = Array.from(card.querySelectorAll('.payment-method-btn'));
        var deliveryOnlyFields = Array.from(card.querySelectorAll('[data-delivery-only="true"]'));
        var pickupOnlyFields = Array.from(card.querySelectorAll('[data-pickup-only="true"]'));
        var estimateNode = document.getElementById('deliveryEstimateNote');
        var formInputs = Array.from(card.querySelectorAll('input, select'));
        var mode = 'delivery';
        var paymentMethod = 'cod';

        function setPaymentMethod(nextMethod) {
            paymentMethod = nextMethod || 'cod';

            paymentButtons.forEach(function (button) {
                var isActive = button.getAttribute('data-payment') === paymentMethod;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        }

        function setMode(nextMode) {
            mode = nextMode === 'pickup' ? 'pickup' : 'delivery';

            modeButtons.forEach(function (button) {
                var isActive = button.getAttribute('data-mode') === mode;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });

            deliveryOnlyFields.forEach(function (field) {
                field.classList.toggle('is-hidden', mode === 'pickup');
            });

            pickupOnlyFields.forEach(function (field) {
                field.classList.toggle('is-hidden', mode !== 'pickup');
            });

            if (estimateNode) {
                estimateNode.textContent = mode === 'pickup'
                    ? 'Pick up location: Main Branch - Mango Village, Salitran IV, Dasmarinas, Cavite.'
                    : 'Estimated delivery: 1-3 business days.';
            }
        }

        function saveForm() {
            var payload = {
                mode: mode,
                fullName: (document.getElementById('deliveryFullName') || {}).value || '',
                phone: (document.getElementById('deliveryPhone') || {}).value || '',
                street: (document.getElementById('deliveryStreet') || {}).value || '',
                city: (document.getElementById('deliveryCity') || {}).value || '',
                zip: (document.getElementById('deliveryZip') || {}).value || '',
                instructions: (document.getElementById('deliveryInstructions') || {}).value || '',
                pickupBranch: (document.getElementById('pickupBranch') || {}).value || '',
                paymentMethod: paymentMethod
            };
            localStorage.setItem(DELIVERY_FORM_KEY, JSON.stringify(payload));
        }

        function loadForm() {
            try {
                var raw = localStorage.getItem(DELIVERY_FORM_KEY);
                if (!raw) {
                    setMode('delivery');
                    return;
                }

                var saved = JSON.parse(raw);
                if (!saved || typeof saved !== 'object') {
                    setMode('delivery');
                    return;
                }

                if (document.getElementById('deliveryFullName')) document.getElementById('deliveryFullName').value = saved.fullName || '';
                if (document.getElementById('deliveryPhone')) document.getElementById('deliveryPhone').value = saved.phone || '';
                if (document.getElementById('deliveryStreet')) document.getElementById('deliveryStreet').value = saved.street || '';
                if (document.getElementById('deliveryCity')) document.getElementById('deliveryCity').value = saved.city || '';
                if (document.getElementById('deliveryZip')) document.getElementById('deliveryZip').value = saved.zip || '';
                if (document.getElementById('deliveryInstructions')) document.getElementById('deliveryInstructions').value = saved.instructions || '';
                if (document.getElementById('pickupBranch')) document.getElementById('pickupBranch').value = saved.pickupBranch || 'Mango Village, Salitran IV, Dasmarinas, Cavite';
                setPaymentMethod(saved.paymentMethod || 'cod');
                setMode(saved.mode || 'delivery');
            } catch (err) {
                setPaymentMethod('cod');
                setMode('delivery');
            }
        }

        modeButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                setMode(button.getAttribute('data-mode'));
                saveForm();
            });
        });

        paymentButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                setPaymentMethod(button.getAttribute('data-payment'));
                saveForm();
            });
        });

        formInputs.forEach(function (input) {
            input.addEventListener('input', saveForm);
        });

        if (!paymentButtons.length) {
            paymentMethod = 'cod';
        }

        loadForm();
    }

    function bindOrderPlacedModal() {
        var proceedBtn = document.getElementById('proceedInquiryBtn');
        var modal = document.getElementById('orderPlacedModal');
        var metaNode = document.getElementById('orderPlacedMeta');
        var notesNode = document.getElementById('orderPlacedNotes');
        if (!proceedBtn || !modal) return;

        proceedBtn.addEventListener('click', function (event) {
            event.preventDefault();

            var items = readCart();
            if (!items.length) {
                return;
            }

            var totalQty = getTotalQuantity(items);
            var subtotal = getSubtotal(items);
            var deliveryFee = totalQty * DELIVERY_FEE_PER_PIECE;
            var grandTotal = subtotal + deliveryFee;

            var deliveryInfo = {};
            try {
                deliveryInfo = JSON.parse(localStorage.getItem(DELIVERY_FORM_KEY) || '{}') || {};
            } catch (err) {
                deliveryInfo = {};
            }

            var modeLabel = (deliveryInfo.mode || 'delivery') === 'pickup' ? 'Pick Up' : 'Delivery';
            var paymentLabelMap = {
                cod: 'Cash on Delivery',
                gcash: 'GCash',
                bank: 'Bank Transfer'
            };
            var paymentLabel = paymentLabelMap[deliveryInfo.paymentMethod] || 'Cash on Delivery';
            var orderNotes = (localStorage.getItem(ORDER_NOTES_KEY) || '').trim();

            if (metaNode) {
                metaNode.textContent = modeLabel + ' - ' + paymentLabel + ' - Total ' + formatCurrency(grandTotal);
            }

            if (notesNode) {
                notesNode.textContent = 'Notes: ' + (orderNotes || '-');
            }

            // Simulate completed purchase by clearing cart contents.
            persistCart([]);
            updateCartBadge();
            renderCartPage();

            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
        });
    }

    function renderCartPage() {
        var cartContainer = document.getElementById('cartItemsList');
        if (!cartContainer) return;

        var items = readCart();

        if (!items.length) {
            cartContainer.innerHTML = '<div class="cart-empty">Your cart is empty. <a href="index.html#products">Browse products</a>.</div>';
            updateCartSummary(items);
            return;
        }

        var html = items.map(function (item, index) {
            var safeTitle = item.title || 'Product';
            var safeType = item.type || 'Precast Block';
            var safeImg = item.image || 'images/home_product/conventional.png';
            var qty = Number(item.quantity) || 1;
            var unitPrice = Number(item.price) || 0;
            var lineTotal = unitPrice * qty;

            return [
                '<article class="cart-item">',
                '  <div class="cart-col-product">',
                '    <img class="cart-item-img" src="' + safeImg + '" alt="' + safeTitle + '">',
                '    <div class="cart-item-content">',
                '      <h3 class="cart-item-title">' + safeTitle + '</h3>',
                '      <p class="cart-item-type">' + safeType + '</p>',
                '    </div>',
                '  </div>',
                '  <div class="cart-col-price">' + formatCurrency(unitPrice) + '</div>',
                '  <div class="cart-col-qty">',
                '    <div class="qty-control">',
                '      <button class="qty-btn" type="button" data-action="decrease" data-index="' + index + '">-</button>',
                '      <span class="qty-value">' + qty + '</span>',
                '      <button class="qty-btn" type="button" data-action="increase" data-index="' + index + '">+</button>',
                '    </div>',
                '  </div>',
                '  <div class="cart-col-total">' + formatCurrency(lineTotal) + '</div>',
                '  <button class="cart-remove-btn" type="button" data-action="remove" data-index="' + index + '" aria-label="Remove item">',
                '    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
                '      <polyline points="3 6 5 6 21 6"></polyline>',
                '      <path d="M19 6l-1 14H6L5 6"></path>',
                '      <path d="M10 11v6"></path>',
                '      <path d="M14 11v6"></path>',
                '      <path d="M9 6V4h6v2"></path>',
                '    </svg>',
                '  </button>',
                '</article>'
            ].join('');
        }).join('');

        cartContainer.innerHTML = html;
        updateCartSummary(items);
    }

    function bindCartPageEvents() {
        var cartContainer = document.getElementById('cartItemsList');
        if (!cartContainer) return;

        cartContainer.addEventListener('click', function (event) {
            var button = event.target.closest('button[data-action]');
            if (!button) return;

            var items = readCart();
            var index = Number(button.getAttribute('data-index'));
            var action = button.getAttribute('data-action');

            if (!Number.isInteger(index) || index < 0 || index >= items.length) {
                return;
            }

            if (action === 'increase') {
                items[index].quantity = (Number(items[index].quantity) || 0) + 1;
            }

            if (action === 'decrease') {
                var nextQty = (Number(items[index].quantity) || 1) - 1;
                items[index].quantity = Math.max(1, nextQty);
            }

            if (action === 'remove') {
                items.splice(index, 1);
            }

            persistCart(items);
            updateCartBadge();
            renderCartPage();
        });

        var clearBtn = document.getElementById('clearCartBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                persistCart([]);
                updateCartBadge();
                renderCartPage();
            });
        }
    }

    async function initializeCartData() {
        backendBase = getBackendBasePath();
        currentUser = await fetchCurrentUser();
        var currentOwner = getCartOwner();

        if (!currentUser || !currentUser.id) {
            if (currentOwner && currentOwner !== 'guest') {
                writeCart([]);
                setCartOwner('guest');
            }
            return;
        }

        var canMergeLocal = !currentOwner || currentOwner === 'guest';
        var serverItems = await fetchServerCart();
        var mergedItems;

        if (canMergeLocal) {
            var localItems = readCart();
            mergedItems = mergeCartCollections(serverItems, localItems);

            var hasChanges = JSON.stringify(serverItems) !== JSON.stringify(mergedItems);
            if (hasChanges) {
                await saveServerCart(mergedItems);
            }
        } else {
            mergedItems = serverItems;
        }

        writeCart(mergedItems);
        setCartOwner(String(currentUser.id));
    }

    document.addEventListener('DOMContentLoaded', async function () {
        await initializeCartData();
        updateCartBadge();
        bindHeaderCartButton();
        bindAddToCartButtons();
        renderCartPage();
        bindCartPageEvents();
        bindOrderNotes();
        bindDeliveryInfoForm();
        bindOrderPlacedModal();
    });
})();
