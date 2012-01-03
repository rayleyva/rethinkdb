#ifndef CONTAINERS_DATA_BUFFER_HPP_
#define CONTAINERS_DATA_BUFFER_HPP_

#include "errors.hpp"
#include <boost/intrusive_ptr.hpp>

struct data_buffer_t {
private:
    int64_t ref_count_;
    int64_t size_;
    char bytes_[];

    friend void intrusive_ptr_add_ref(data_buffer_t *buffer);
    friend void intrusive_ptr_release(data_buffer_t *buffer);

    DISABLE_COPYING(data_buffer_t);

public:
    static void destroy(data_buffer_t *p) {
        rassert(p->ref_count_ == 0);
        free(p);
    }

    static boost::intrusive_ptr<data_buffer_t> create(int64_t size) {
        rassert(sizeof(data_buffer_t) == 16);
        data_buffer_t *b = reinterpret_cast<data_buffer_t *>(malloc(sizeof(data_buffer_t) + size));
        b->ref_count_ = 0;
        b->size_ = size;
        return boost::intrusive_ptr<data_buffer_t>(b);
    }

    char *buf() { return bytes_; }
    const char *buf() const { return bytes_; }
    int64_t size() const { return size_; }
};

inline void intrusive_ptr_add_ref(data_buffer_t *buffer) {
    UNUSED int64_t res = __sync_add_and_fetch(&buffer->ref_count_, 1);
    rassert(res > 0);
}

inline void intrusive_ptr_release(data_buffer_t *buffer) {
    int64_t res = __sync_sub_and_fetch(&buffer->ref_count_, 1);
    rassert(res >= 0);
    if (res == 0) {
        data_buffer_t::destroy(buffer);
    }
}



#endif  // CONTAINERS_DATA_BUFFER_HPP_