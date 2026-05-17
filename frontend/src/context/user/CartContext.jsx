import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';
import { cartService } from '../../services/cart.service';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🌟 ĐÃ SỬA: Đưa hàm này ra ngoài để làm hàm tái sử dụng (Exposed Function)
    const fetchCart = async () => {
        if (user) {
            try {
                setLoading(true);

                const savedGuestCart = localStorage.getItem('cart_guest');
                if (savedGuestCart) {
                    const guestItems = JSON.parse(savedGuestCart);
                    if (guestItems.length > 0) {
                        for (const item of guestItems) {
                            await cartService.addToCart(item.product_id, item.quantity);
                        }
                        localStorage.removeItem('cart_guest');
                    }
                }

                const res = await cartService.getCart();
                if (res.success) {
                    // Dữ liệu sản phẩm được làm phẳng ở đây
                    const mappedItems = res.data.map(item => ({
                        ...item.product,
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

    // Tự động load khi user thay đổi trạng thái đăng nhập
    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (product) => {
        const existingItem = cartItems.find(item => item.product_id === product.product_id);

        if (user) {
            try {
                const res = await cartService.addToCart(product.product_id, 1);
                if (res.success) {
                    toast.success(existingItem ? `Đã tăng số lượng ${product.name}` : `Đã thêm ${product.name} vào giỏ hàng`);
                    setCartItems(prev => {
                        const itemExists = prev.find(item => item.product_id === product.product_id);
                        if (itemExists) {
                            return prev.map(item => item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item);
                        }
                        return [...prev, { ...product, quantity: 1 }];
                    });
                }
            } catch (error) {
                toast.error("Lỗi không thể kết nối tới giỏ hàng hệ thống");
            }
        } else {
            toast.success(existingItem ? `Đã tăng số lượng ${product.name}` : `Đã thêm ${product.name} vào giỏ hàng khách`);
            setCartItems(prev => {
                let newCart;
                const itemExists = prev.find(item => item.product_id === product.product_id);
                if (itemExists) {
                    newCart = prev.map(item => item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item);
                } else {
                    newCart = [...prev, { ...product, quantity: 1 }];
                }
                localStorage.setItem('cart_guest', JSON.stringify(newCart));
                return newCart;
            });
        }
    };

    const removeFromCart = async (productId) => {
        if (user) {
            try {
                await cartService.removeFromCart(productId);
            } catch (e) {
                console.error("Lỗi xóa sản phẩm DB:", e);
            }
        }

        setCartItems(prev => {
            const newCart = prev.filter(item => item.product_id !== productId);
            if (!user) {
                localStorage.setItem('cart_guest', JSON.stringify(newCart));
            }
            return newCart;
        });
        toast.info("Đã xóa sản phẩm khỏi giỏ hàng");
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        if (user) {
            try {
                await cartService.updateQuantity(productId, quantity);
            } catch (e) {
                console.error("Lỗi cập nhật số lượng DB:", e);
            }
        }

        setCartItems(prev => {
            const newCart = prev.map(item => item.product_id === productId ? { ...item, quantity } : item);
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
        // 🌟 ĐÃ SỬA: Đưa fetchCart vào đây để trang Checkout sử dụng công khai
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, fetchCart, loading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);