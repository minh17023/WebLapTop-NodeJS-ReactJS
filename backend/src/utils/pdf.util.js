const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

function generateInvoicePDF(order, items, res) {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    doc.pipe(res);

    const fontRegular = 'C:\\Windows\\Fonts\\arial.ttf';
    const fontBold = 'C:\\Windows\\Fonts\\arialbd.ttf';

    // Đăng ký font hoặc sử dụng font Helvetica mặc định nếu chạy ngoài Windows (phòng hờ)
    try {
        if (fs.existsSync(fontRegular)) {
            doc.registerFont('Arial', fontRegular);
        } else {
            doc.registerFont('Arial', 'Helvetica');
        }

        if (fs.existsSync(fontBold)) {
            doc.registerFont('Arial-Bold', fontBold);
        } else {
            doc.registerFont('Arial-Bold', 'Helvetica-Bold');
        }
        
        doc.font('Arial');
    } catch (e) {
        console.error("Lỗi đăng ký font chữ Việt Hóa:", e);
        doc.font('Helvetica');
    }

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    // ================= HEADER =================
    doc.fillColor('#dc2626')
       .font('Arial-Bold')
       .fontSize(24)
       .text('HNC LAPTOP', 40, 45);

    doc.fillColor('#4b5563')
       .font('Arial')
       .fontSize(9)
       .text('Hệ thống bán lẻ Laptop & Phụ kiện cao cấp', 40, 75)
       .text('Địa chỉ: 123 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội', 40, 90)
       .text('Hotline: 1900 8198 | Email: contact@hnclaptop.vn', 40, 105);

    const orderId = order.order_id || order.id;
    doc.fillColor('#1f2937')
       .font('Arial-Bold')
       .fontSize(14)
       .text('HÓA ĐƠN BÁN HÀNG', 380, 45, { align: 'right' });

    doc.fillColor('#4b5563')
       .font('Arial')
       .fontSize(9)
       .text(`Mã hóa đơn: #INV-${orderId}`, 380, 65, { align: 'right' })
       .text(`Ngày lập: ${new Date(order.created_at || order.createdAt).toLocaleDateString('vi-VN')}`, 380, 80, { align: 'right' })
       .text(`Thanh toán: ${order.payment_method || 'COD'}`, 380, 95, { align: 'right' })
       .text(`Trạng thái: ${order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}`, 380, 110, { align: 'right', colors: order.payment_status === 'paid' ? '#16a34a' : '#dc2626' });

    doc.moveTo(40, 130).lineTo(550, 130).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // ================= CUSTOMER INFO =================
    doc.fillColor('#1f2937')
       .font('Arial-Bold')
       .fontSize(11)
       .text('THÔNG TIN GIAO HÀNG', 40, 145);

    doc.fillColor('#4b5563')
       .font('Arial')
       .fontSize(9)
       .text(`Khách hàng: ${order.full_name}`, 40, 165)
       .text(`Số điện thoại: ${order.phone}`, 40, 180)
       .text(`Địa chỉ giao: ${order.shipping_address}`, 40, 195, { width: 510, lineGap: 3 });

    doc.moveTo(40, 230).lineTo(550, 230).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // ================= ITEMS TABLE =================
    doc.fillColor('#1f2937')
       .font('Arial-Bold')
       .fontSize(11)
       .text('DANH SÁCH SẢN PHẨM ĐÃ ĐẶT', 40, 245);

    const tableTop = 270;
    doc.fillColor('#374151')
       .font('Arial-Bold')
       .fontSize(9);

    doc.text('STT', 40, tableTop);
    doc.text('Tên sản phẩm', 70, tableTop, { width: 250 });
    doc.text('Đơn giá', 330, tableTop, { width: 90, align: 'right' });
    doc.text('SL', 430, tableTop, { width: 30, align: 'center' });
    doc.text('Thành tiền', 470, tableTop, { width: 80, align: 'right' });

    doc.moveTo(40, 285).lineTo(550, 285).strokeColor('#9ca3af').lineWidth(1).stroke();

    let currentY = 295;
    items.forEach((item, index) => {
        const productName = item.product?.name || 'Sản phẩm Laptop HNC';
        const price = Number(item.price_at_purchase) || 0;
        const qty = Number(item.quantity) || 1;
        const total = price * qty;

        doc.fillColor('#4b5563')
           .font('Arial')
           .fontSize(9);

        doc.text(`${index + 1}`, 40, currentY);
        doc.text(productName, 70, currentY, { width: 250, height: 24, lineBreak: true });
        doc.text(formatPrice(price), 330, currentY, { width: 90, align: 'right' });
        doc.text(`${qty}`, 430, currentY, { width: 30, align: 'center' });
        doc.text(formatPrice(total), 470, currentY, { width: 80, align: 'right' });

        currentY += 28;
    });

    doc.moveTo(40, currentY).lineTo(550, currentY).strokeColor('#e5e7eb').lineWidth(1).stroke();

    // ================= TOTALS SUMMARY =================
    currentY += 15;
    
    const itemsAmount = items.reduce((sum, item) => sum + (Number(item.price_at_purchase) * Number(item.quantity)), 0);
    const shippingFee = Number(order.shipping_fee) || 0;
    const totalAmount = Number(order.total_amount) || (itemsAmount + shippingFee);

    doc.fillColor('#4b5563')
       .font('Arial')
       .fontSize(9);

    doc.text('Cộng tiền hàng:', 350, currentY, { width: 100, align: 'right' });
    doc.text(formatPrice(itemsAmount), 450, currentY, { width: 100, align: 'right' });

    currentY += 18;
    doc.text('Phí vận chuyển:', 350, currentY, { width: 100, align: 'right' });
    doc.text(shippingFee > 0 ? formatPrice(shippingFee) : 'Miễn phí', 450, currentY, { width: 100, align: 'right' });

    currentY += 22;
    doc.fillColor('#1f2937')
       .font('Arial-Bold')
       .fontSize(12);
    doc.text('Tổng cộng:', 350, currentY, { width: 100, align: 'right' });
    doc.fillColor('#dc2626')
       .text(formatPrice(totalAmount), 450, currentY, { width: 100, align: 'right' });

    // ================= FOOTER =================
    doc.fillColor('#9ca3af')
       .font('Arial')
       .fontSize(8)
       .text('Cảm ơn quý khách đã tin tưởng và mua sắm tại HNC Laptop!', 40, 750, { align: 'center' })
       .text('Mọi khiếu nại hoặc cần hỗ trợ bảo hành xin liên hệ Hotline 1900 8198.', 40, 765, { align: 'center' });

    doc.end();
}

module.exports = { generateInvoicePDF };
