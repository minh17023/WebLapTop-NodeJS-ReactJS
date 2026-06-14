import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';
import { cartService } from '../services/cart.service';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        if (user) {
            try {
                setLoading(true);

                const savedGuestCart = localStorage.getItem('cart_guest');
                if (savedGuestCart) {
                    const guestItems = JSON.parse(savedGuestCart);
                    if (guestItems.length > 0) {
                        for (const item of guestItems) {
                            await cartService.addToCart(item.product_id, item.variant_id, item.quantity);
                        }
                        localStorage.removeItem('cart_guest');
                    }
                }

                const res = await cartService.getCart();
                if (res.success) {
                    const mappedItems = res.data.map(item => ({
                        ...item.product,
                        variant_id: item.variant_id,
                        price: item.variant?.price || item.product?.price,
                        discount_price: item.variant?.discount_price || item.product?.discount_price,
                        ram: item.variant?.ram,
                        ssd: item.variant?.ssd,
                        stock_quantity: item.variant?.stock_quantity,
                        quantity: item.quantity
                    }));
                    setCartItems(mappedItems);
                }
            } catch (error) {
                console.error("Lỗi tải giỏ hàng hệ thống:", error);
            } finally {
                setLoading(false);
            }
        } else {
            const savedCart = localStorage.getItem('cart_guest');
            setCartItems(savedCart ? JSON.parse(savedCart) : []);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (product, selectedVariant, quantityToAdd = 1) => {
        if (!selectedVariant || !selectedVariant.variant_id) {
             toast.error('Vui lòng chọn cấu hình sản phẩm!');
             return;
        }

        const cartItemToSave = {
             ...product,
             variant_id: selectedVariant.variant_id,
             price: selectedVariant.price,
             discount_price: selectedVariant.discount_price,
             ram: selectedVariant.ram,
             ssd: selectedVariant.ssd,
             stock_quantity: selectedVariant.stock_quantity
        };

        const existingItemIndex = cartItems.findIndex(item => item.product_id === product.product_id && item.variant_id === selectedVariant.variant_id);
        const existingItem = existingItemIndex >= 0;

        if (existingItem) {
            if (cartItems[existingItemIndex].quantity + quantityToAdd > selectedVariant.stock_quantity) {
                toast.warning(`Sản phẩm này chỉ còn ${selectedVariant.stock_quantity} chiếc trong kho!`);
                return;
            }
        } else {
            if (quantityToAdd > selectedVariant.stock_quantity) {
                toast.warning(`Sản phẩm này chỉ còn ${selectedVariant.stock_quantity} chiếc trong kho!`);
                return;
            }
        }

        if (user) {
            try {
                const res = await cartService.addToCart(product.product_id, selectedVariant.variant_id, quantityToAdd);
                if (res.success) {
                    toast.success(existingItem ? `Đã tăng thêm ${quantityToAdd} ${product.name} vào giỏ` : `Đã thêm ${quantityToAdd} ${product.name} vào giỏ hàng`);
                    setCartItems(prev => {
                        if (existingItem) {
                            return prev.map((item, idx) => idx === existingItemIndex ? { ...item, quantity: item.quantity + quantityToAdd } : item);
                        }
                        return [...prev, { ...cartItemToSave, quantity: quantityToAdd }];
                    });
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Lỗi không thể kết nối tới giỏ hàng hệ thống");
            }
        } else {
            toast.success(existingItem ? `Đã tăng thêm ${quantityToAdd} ${product.name} vào giỏ` : `Đã thêm ${quantityToAdd} ${product.name} vào giỏ hàng khách`);
            setCartItems(prev => {
                let newCart;
                if (existingItem) {
                    newCart = prev.map((item, idx) => idx === existingItemIndex ? { ...item, quantity: item.quantity + quantityToAdd } : item);
                } else {
                    newCart = [...prev, { ...cartItemToSave, quantity: quantityToAdd }];
                }
                localStorage.setItem('cart_guest', JSON.stringify(newCart));
                return newCart;
            });
        }
    };

    const removeFromCart = async (productId, variantId) => {
        if (user) {
            try {
                await cartService.removeFromCart(productId, variantId);
            } catch (e) {
                console.error("Lỗi xóa sản phẩm DB:", e);
            }
        }

        setCartItems(prev => {
            const newCart = prev.filter(item => !(item.product_id === productId && item.variant_id === variantId));
            if (!user) {
                localStorage.setItem('cart_guest', JSON.stringify(newCart));
            }
            return newCart;
        });
        toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
    };

    const updateQuantity = async (productId, variantId, quantity) => {
        if (quantity < 1) return;

        const targetItem = cartItems.find(item => item.product_id === productId && item.variant_id === variantId);
        if (targetItem && targetItem.stock_quantity !== undefined && quantity > targetItem.stock_quantity) {
            toast.warning(`Sản phẩm này chỉ còn ${targetItem.stock_quantity} chiếc trong kho!`);
            return;
        }

        if (user) {
            try {
                await cartService.updateQuantity(productId, variantId, quantity);
            } catch (e) {
                console.error("Lỗi cập nhật số lượng DB:", e);
            }
        }

        setCartItems(prev => {
            const newCart = prev.map(item => (item.product_id === productId && item.variant_id === variantId) ? { ...item, quantity } : item);
            if (!user) {
                localStorage.setItem('cart_guest', JSON.stringify(newCart));
            }
            return newCart;
        });
    };

    const clearCart = async () => {
        if (user) {
            try {
                await cartService.clearCart();
            } catch (e) {
                console.error("Lỗi dọn sạch giỏ DB:", e);
            }
        }
        setCartItems([]);
        localStorage.removeItem('cart_guest');
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const activePrice = item.discount_price || item.price;
            return total + (Number(activePrice) * item.quantity);
        }, 0);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, fetchCart, loading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);