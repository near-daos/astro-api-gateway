package api.app.astrodao.com.core.dto.api.proposals;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProposalResponse {
    private BigDecimal count;
    private BigDecimal total;
    private BigDecimal page;
    private BigDecimal pageCount;
    private List<ProposalDto> data;
}
