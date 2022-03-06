package api.app.astrodao.com.core.dto.api.notigications;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class NotificationsResponse {
    private BigDecimal count;
    private BigDecimal total;
    private BigDecimal page;
    private BigDecimal pageCount;
    private List<Notification> data;
}
