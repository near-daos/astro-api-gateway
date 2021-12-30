package api.app.astrodao.com.core.dto.api.dao;

import api.app.astrodao.com.openapi.models.DaoFeed;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class DaoFeedResponse {
    private BigDecimal count;
    private BigDecimal total;
    private BigDecimal page;
    private BigDecimal pageCount;
    private List<DaoFeed> data = new ArrayList<>();
}
